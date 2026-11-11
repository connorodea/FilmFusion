"""Offline unit tests for deliberately broken contract and idea fixtures."""

from __future__ import annotations

import copy
import unittest
from pathlib import Path

from verify_kit import (
    ContractError,
    load_json,
    verify_episode_references,
    verify_idea_scores,
    verify_json_schema,
    verify_pilot_configuration,
)


KIT = Path(__file__).resolve().parent


class ContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.schema = load_json(KIT / "episode.schema.json")
        self.episode = load_json(KIT / "episode.example.json")

    def test_valid_draft(self) -> None:
        verify_json_schema(self.schema, self.episode)
        verify_episode_references(self.episode)

    def test_missing_rig_asset(self) -> None:
        bad = copy.deepcopy(self.episode)
        bad["characters"][0]["rig_asset_id"] = "nonexistent"
        with self.assertRaisesRegex(ContractError, "missing rig"):
            verify_episode_references(bad)

    def test_overlapping_shots(self) -> None:
        bad = copy.deepcopy(self.episode)
        bad["shots"][1]["start_frame"] = 299
        with self.assertRaisesRegex(ContractError, "gap/overlap"):
            verify_episode_references(bad)

    def test_unapproved_rights_block_advanced_status(self) -> None:
        bad = copy.deepcopy(self.episode)
        bad["status"] = "qa_pass"
        with self.assertRaisesRegex(ContractError, "unapproved rights"):
            verify_episode_references(bad)

    def test_unknown_action_is_rejected_by_schema(self) -> None:
        bad = copy.deepcopy(self.episode)
        bad["shots"][0]["actions"][0]["primitive"] = "invented_action"
        with self.assertRaisesRegex(ContractError, "episode schema"):
            verify_json_schema(self.schema, bad)

    def test_score_catalog(self) -> None:
        catalog = load_json(KIT / "format_ideas.json")
        verify_idea_scores(catalog)

    def test_score_corruption(self) -> None:
        catalog = load_json(KIT / "format_ideas.json")
        catalog["concepts"][0]["weighted_score"] = 0
        with self.assertRaisesRegex(ContractError, "score incorrect"):
            verify_idea_scores(catalog)

    def test_pilot_configuration_safe(self) -> None:
        bibles = load_json(KIT / "pilot_show_bibles.json")
        settings = load_json(KIT / "channel_settings.example.json")
        verify_pilot_configuration(bibles, settings)

    def test_pilot_cannot_autopublish(self) -> None:
        bibles = load_json(KIT / "pilot_show_bibles.json")
        settings = load_json(KIT / "channel_settings.example.json")
        settings["channels"][0]["content_policy"]["auto_publish"] = True
        with self.assertRaisesRegex(ContractError, "auto-publish forbidden"):
            verify_pilot_configuration(bibles, settings)


if __name__ == "__main__":
    unittest.main()

