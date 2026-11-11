# Research & Experimentation Analytics Specification

## Data authority and missingness

Do not confuse (a) public YouTube statistics, (b) third-party tracker model estimates, and (c) private YouTube Studio analytics. Every record stores `source_type`, `source_url`, `observed_at`, `metric_name`, `metric_value`, `window_start`, `window_end`, `format`, `methodology_version` and `status: observed|estimated|unavailable`. A metric absent from a public API is `unavailable`, never filled with a guessed value.

Public source methods: `channels.list` with `forHandle` and `statistics,contentDetails`; extract uploads playlist, use `playlistItems.list` for upload ID discovery and `videos.list` for statistics, content details and dates. Use `search.list` for discovery only when needed, respecting its separate quota bucket. Owner metrics use consented YouTube Analytics OAuth and do not get exposed through public research reports.

Official source docs:
- https://developers.google.com/youtube/data/reference/rest/v3/channels/list
- https://developers.google.com/youtube/data/reference/rest/v3/videos/list
- https://developers.google.com/youtube/data/determine_quota_cost
- https://developers.google.com/youtube/analytics/sample-requests
- https://developers.google.com/youtube/analytics/data_model

## Public competitor metrics

| Metric | Computation | Caveat |
| --- | --- | --- |
| Views at matched video age | Snapshots nearest 24h/72h/7d/28d | Do not interpolate if snapshots too sparse |
| 7d momentum | `views_t7 - views_t0` | Public count methodology and corrections apply |
| Cohort median | Median within channel AND Short/long AND duration bin | Small sample uncertainty; show `n` |
| Matched-age outlier ratio | `views_7d / median_views_7d_comparable` | Undefined if insufficient cohort or zero baseline |
| Velocity | `(views_t2 - views_t1) / hours_elapsed` | Current velocity may be volatile; not sustained |
| Likes per 1K public views | `likes/views*1000` | Likes can be hidden/meaning differs by format |
| Comments per 1K | `comments/views*1000` | Topic, comment moderation and audience differ |
| Upload cadence | Releases in last 28d by format | Reuploads/compilations distort counts |

Recommended binning: Shorts 0–30s, 31–60s, 61–180s; long-form 3–6m, 6–12m, 12m+. Respect actual YouTube content-format identifiers when available; runtime alone should not be treated as definitive Short classification. Do not compare animation to gaming streams or children's compilations without a deliberate normalized segment.

### Do not extrapolate from cumulative averages

`lifetime_channel_views / uploads` is an arithmetic description, **not** the median upload performance, current expected views, or a modeled growth rate. It is often dominated by older viral videos and years of long-tail distribution. Survivor bias requires adding poor performers and recently founded channels to the research pool.

## Owned-channel performance

| Funnel phase | Primary metric | Additional diagnostic |
| --- | --- | --- |
| Impression | Impression click-through rate where accessible | Title/thumbnail promise alignment |
| First 30s | Retained viewers at 30s | Specific first-shot and hook drop-off |
| Sustained episode | Average percentage viewed and average view duration | Retention curve, rewatch behavior |
| Shorts | Engaged views, viewed-vs-swiped, avg percent watched | Public play-start views separately |
| Franchise depth | Returning viewers and next-episode transitions | Playlist and end-screen actions |
| Community | Fan discussion about recurring characters; shares | Comment quality sample, no fabricated sentiment |
| Revenue | Realized owner-reported revenue, RPM and cost | Ads vs sponsorship vs merchandise separate |
| Operational | Approved minutes per production hour | Cost per approved finished minute |

YouTube Analytics documentation: https://developers.google.com/youtube/analytics/metrics . Public and private dimensions can have different dates and lags; private owner metrics are delayed for processing.

## Experimental hypotheses and preregistration

Use paired hypotheses on the **same franchise** when feasible:

1. Specific character problem vs abstract premise in title.
2. Cold-open visual failure vs explanatory setup.
3. 25–35s gag vs 45–65s gag.
4. Two-character exchange vs voiceover-led scene.
5. Original thumbnail: character reaction vs impossible object/event.
6. Cliffhanger teaser vs complete gag for long-form conversion.

Before seeing results, record outcome, eligible viewer cohort, planned release schedule, sample size, comparison rules, exclusion rules and decision date. YouTube's own thumbnail test tool (when available) is preferable to informal thumbnail swaps; avoid drawing conclusions from tiny samples.

## Data decisions after 28 days

Review each channel on:

- Evidence of **multiple** outlier releases, not just one;
- Better content retention at matched length, especially repeated episodes;
- Fan recognition of recurring characters;
- Sustainable cost per approved minute and revision burden;
- Source rights and original-content eligibility;
- Potential monetization routes beyond ads.

States: `scale_experiment`, `iterate`, `hold`, `stop`. The decision record must explain the strongest evidence **and** the strongest counterevidence. If n is too small, explicitly hold.

## Metric versioning

Store `public_views_definition` as:

```json
{
  "shorts_public_views_before_2025_03_31": "historic",
  "shorts_public_views_from_2025_03_31": "starts_or_replays",
  "channel_total_from_2026_08_24": "all_format_play_starts_including_autoplay_hover",
  "owner_engaged_views": "separate_private_metric"
}
```

Official announcements: https://support.google.com/youtube/thread/333869549 ; https://developers.google.com/youtube/data/reference/rest/v3/channels . Do not multiply public views by an invented correction factor to simulate old definitions.

## Privacy and policy

Respect YouTube API storage restrictions and refresh/delete covered metadata after 30 days as required. Query only scopes needed; encrypt owner OAuth secrets, restrict tenant views, and avoid retaining scraped personal comment data beyond a documented research purpose. Source: https://developers.google.com/youtube/analytics/data_model .

