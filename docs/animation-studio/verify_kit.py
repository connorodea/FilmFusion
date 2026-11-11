#!/usr/bin/env python3
"""Offline validator for the research data and example episode contract.

This validator makes no network or paid AI API calls. Install jsonschema>=4.23.
Usage: python AnimationStudioKit/verify_kit.py
       python AnimationStudioKit/verify_kit.py --episode /path/to/custom_episode.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

try:
    from jsonschema import Draft202012Validator, FormatChecker
except ImportError as exc:
    raise SystemExit("Missing dependency: install jsonschema>=4.23,<5") from exc


class ContractError(ValueError):
    """A media/data contract violates a testable invariant."""


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as source:
        document = json.load(source)
    if not isinstance(document, dict):
        raise ContractError(f"{path}: expected a JSON object")
    return document


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ContractError(message)


def verify_json_schema(schema: dict[str, Any], episode: dict[str, Any]) -> None:
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    errors = sorted(validator.iter_errors(episode), key=lambda error: list(map(str, error.path)))
    if errors:
        first = errors[0]
        location = "/".join(map(str, first.absolute_path)) or "<root>"
        raise ContractError(f"episode schema failed at {location}: {first.message}")


def verify_episode_references(episode: dict[str, Any]) -> None:
    assets = {entry["id"]: entry for entry in episode["assets"]}
    characters = {entry["id"]: entry for entry in episode["characters"]}
    require(len(assets) == len(episode["assets"]), "duplicate asset id")
    require(len(characters) == len(episode["characters"]), "duplicate character id")

    for character in episode["characters"]:
        rig_id = character["rig_asset_id"]
        require(rig_id in assets, f"missing rig asset {rig_id}")
        require(assets[rig_id]["kind"] == "rig", f"rig asset {rig_id} is not a rig")

    shots = sorted(episode["shots"], key=lambda item: item["start_frame"])
    require(len({shot["shot_id"] for shot in shots}) == len(shots), "duplicate shot id")
    expected_start = 0
    seen_line_ids: set[str] = set()

    for shot in shots:
        shot_id = shot["shot_id"]
        start = shot["start_frame"]
        end = start + shot["duration_frames"]
        require(start == expected_start, f"{shot_id}: expected start {expected_start}, got {start}; gap/overlap")
        require(end <= episode["duration_frames"], f"{shot_id}: shot exceeds episode duration")
        expected_start = end

        background = shot["background_asset_id"]
        require(background in assets, f"{shot_id}: missing background {background}")
        require(assets[background]["kind"] == "background", f"{shot_id}: invalid background type")
        present = set(shot["characters_present"])
        require(present <= characters.keys(), f"{shot_id}: unknown character in scene")

        for prop in shot.get("prop_asset_ids", []):
            require(prop in assets, f"{shot_id}: missing prop {prop}")
            require(assets[prop]["kind"] in {"prop", "overlay"}, f"{shot_id}: wrong prop kind for {prop}")

        for action in shot["actions"]:
            require(action["actor_id"] in present, f"{shot_id}: action actor absent: {action['actor_id']}")
            action_start = action["start_frame"]
            action_end = action_start + action["duration_frames"]
            require(start <= action_start < action_end <= end, f"{shot_id}: action outside shot")

        for line in shot["dialogue"]:
            line_id = line["line_id"]
            require(line_id not in seen_line_ids, f"duplicate dialogue line id {line_id}")
            seen_line_ids.add(line_id)
            require(line["speaker_id"] in present, f"{shot_id}: dialogue speaker absent")
            line_start = line["start_frame"]
            line_end = line_start + line["duration_frames"]
            require(start <= line_start < line_end <= end, f"{shot_id}: dialogue outside shot")

        for sound in shot["sounds"]:
            sound_id = sound["asset_id"]
            require(sound_id in assets, f"{shot_id}: missing sound {sound_id}")
            require(assets[sound_id]["kind"] in {"sfx", "music"}, f"{shot_id}: sound asset wrong kind")
            sound_start = sound["start_frame"]
            sound_end = sound_start + sound["duration_frames"]
            require(start <= sound_start < sound_end <= end, f"{shot_id}: sound outside shot")

    require(expected_start == episode["duration_frames"], "shots do not cover entire duration")
    thumbnail = episode["publication"].get("thumbnail_asset_id")
    if thumbnail is not None:
        require(thumbnail in assets, "missing thumbnail asset")
        require(assets[thumbnail]["kind"] == "thumbnail", "thumbnail wrong asset kind")

    gated = {"assets_approved", "audio_approved", "rendered", "qa_pass", "human_approved", "published"}
    if episode["status"] in gated:
        for asset in episode["assets"]:
            require(asset["rights"]["human_checked"], f"unapproved rights: {asset['id']}")
            require(asset.get("content_hash_sha256") is not None, f"missing content hash: {asset['id']}")
    if episode["status"] in {"human_approved", "published"}:
        require(episode["publication"]["human_release_approved"], "released without human authorization")
    if episode["publication"]["human_release_approved"]:
        require(episode["status"] in {"human_approved", "published"}, "approval flag inconsistent with draft")


def verify_idea_scores(catalog: dict[str, Any]) -> None:
    weights = catalog["scoring"]["weights"]
    require(sum(weights.values()) == 100, "score weights must sum to 100")
    require(len(catalog["concepts"]) >= 10, "expected a useful original-idea catalog")
    ids: set[str] = set()
    for concept in catalog["concepts"]:
        name = concept["id"]
        require(name not in ids, f"duplicate idea ID: {name}")
        ids.add(name)
        require(set(concept["scores"]) == set(weights), f"{name}: missing/extraneous score criterion")
        for criterion, value in concept["scores"].items():
            require(isinstance(value, int) and 1 <= value <= 5, f"{name}: invalid {criterion} score")
        expected = sum(weights[criterion] * concept["scores"][criterion] / 5 for criterion in weights)
        require(abs(expected - concept["weighted_score"]) < 0.00001, f"{name}: score incorrect, expected {expected}")


def verify_sources(source_index: dict[str, Any], benchmarks: dict[str, Any]) -> None:
    sources = source_index["sources"]
    require(len({item["id"] for item in sources}) == len(sources), "duplicate source ID")
    for item in sources:
        require(item["url"].startswith("https://"), f"source must be HTTPS: {item['id']}")
    require(len(benchmarks["channels"]) >= 12, "benchmark sample too small for this kit")
    require(len({ch["handle"].lower() for ch in benchmarks["channels"]}) == len(benchmarks["channels"]), "duplicate benchmark handle")
    for channel in benchmarks["channels"]:
        require(channel["channel_url"].startswith("https://www.youtube.com/"), "invalid channel URL")
        require(channel["source_url"].startswith("https://"), "benchmark missing verifiable source URL")
        for key in ("subscribers", "lifetime_views", "video_count"):
            require(isinstance(channel[key], int) and channel[key] >= 0, f"invalid {key} for {channel['handle']}")
        recent = channel.get("recent_views")
        if recent is not None:
            require(recent["window_days"] > 0 and recent["views_approx"] >= 0, "invalid recent window")


def verify_pilot_configuration(bibles: dict[str, Any], settings: dict[str, Any]) -> None:
    show_ids = {show["show_id"] for show in bibles["shows"]}
    require(len(show_ids) == len(bibles["shows"]), "duplicate pilot show bible ID")
    require(len(show_ids) == 3, "expected three deliberately different pilot bibles")
    require(settings["production_environment"] == "dry_run", "example config must stay dry-run")
    require(settings["global_limits"]["human_final_approval_required"], "human gate cannot be disabled")
    require(settings["global_limits"]["total_budget_usd_per_month"] == 0, "example cannot authorize spend")
    require({c["show_id"] for c in settings["channels"]} == show_ids, "config/bible show mismatch")
    require(len(settings["channels"]) == len(show_ids), "duplicate settings show")
    require(settings["external_providers"]["youtube_oauth_connection"] is None, "example must not contain OAuth")
    for show in settings["channels"]:
        require(show["youtube_channel_id"] is None, f"example must not connect real channel: {show['show_id']}")
        require(not show["content_policy"]["auto_publish"], f"auto-publish forbidden in example: {show['show_id']}")
        require(not show["release_window"]["enabled"], f"example schedule must be disabled: {show['show_id']}")


def run(kit: Path, episode_path: Path) -> None:
    schema = load_json(kit / "episode.schema.json")
    episode = load_json(episode_path)
    catalog = load_json(kit / "format_ideas.json")
    benchmark = load_json(kit / "benchmarks.json")
    sources = load_json(kit / "sources.json")
    bibles = load_json(kit / "pilot_show_bibles.json")
    settings = load_json(kit / "channel_settings.example.json")
    verify_json_schema(schema, episode)
    verify_episode_references(episode)
    verify_idea_scores(catalog)
    verify_sources(sources, benchmark)
    verify_pilot_configuration(bibles, settings)
    print(f"PASS: JSON Schema, timeline/rights, {len(catalog['concepts'])} concepts, "
          f"{len(benchmark['channels'])} benchmarks, {len(sources['sources'])} sources, "
          f"{len(bibles['shows'])} disabled pilot configurations")
    if episode["status"] == "draft":
        print("NOTE: draft fixture media/rights IDs are illustrative; not production-cleared")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--episode", type=Path, help="episode JSON, default kit example")
    args = parser.parse_args()
    kit = Path(__file__).resolve().parent
    episode = args.episode or kit / "episode.example.json"
    try:
        run(kit, episode)
    except (OSError, ValueError, KeyError, TypeError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

