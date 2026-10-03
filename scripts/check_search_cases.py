#!/usr/bin/env python3
"""Regression-check ranked task search against canonical question records."""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "questions"
DEFAULT_CASES = ROOT / "tests" / "search-cases.json"

SEARCH_CONCEPTS = [
    {"id": "pdf", "groups": [["pdf"]], "categories": ["documents"], "terms": ["pdf", "pdf分析", "pdf要約", "文書分析", "図表", "グラフ"]},
    {"id": "transcription", "groups": [["文字起こし", "録音", "議事録", "transcription", "transcribe", "音声メモ"]], "categories": ["audio-transcription"], "terms": ["文字起こし", "録音", "議事録", "transcription", "transcribe", "音声", "会議", "要約"]},
    {"id": "spreadsheet-edit", "groups": [["excel", "エクセル", "スプレッドシート", "表計算", "google sheets"], ["編集", "直接", "数式", "書式", "セル", "ブック"]], "categories": ["spreadsheets"], "terms": ["excel", "エクセル", "スプレッドシート", "表計算", "編集", "直接編集", "セル編集", "シート編集", "ブック編集", "数式"]},
    {"id": "data-analysis", "groups": [["excel", "エクセル", "csv", "データ", "表計算"], ["分析", "集計", "グラフ", "レポート", "可視化", "統計"]], "categories": ["data-analysis"], "terms": ["データ分析", "excel 分析", "エクセル 分析", "csv 分析", "集計", "グラフ", "可視化", "統計", "レポート"]},
    {"id": "website", "groups": [["webサイト", "ウェブサイト", "ホームページ", "webアプリ", "ウェブアプリ", "サイトを作", "アプリを作", "簡単なアプリ"]], "categories": ["website-creation"], "terms": ["webサイト", "ウェブサイト", "ホームページ", "webアプリ", "ウェブアプリ", "webページ", "アプリ作成", "公開", "共有"]},
    {"id": "learning", "groups": [["勉強", "学習", "家庭教師", "チューター", "フラッシュカード", "クイズ", "練習問題"]], "categories": ["learning"], "terms": ["勉強", "学習", "家庭教師", "チューター", "フラッシュカード", "クイズ", "練習問題"]},
    {"id": "coding", "groups": [["github", "コード", "リポジトリ", "repository"], ["直", "修正", "編集", "pr", "プルリク", "実装"]], "categories": ["coding"], "terms": ["github", "コード修正", "コード変更", "バグ修正", "リポジトリ", "repository", "pr", "プルリクエスト"]},
    {"id": "web-search", "groups": [["ネットで調べ", "ウェブで調べ", "webで調べ", "ウェブ検索", "web検索", "ネット検索", "最新情報", "現在のウェブ"]], "categories": ["web-research"], "terms": ["ウェブ検索", "web検索", "ネット検索", "現在のウェブ", "最新情報", "出典", "引用"]},
    {"id": "deep-research", "groups": [["deep research", "深掘り", "詳しく調べ", "詳細調査", "詳細に調べ", "複数の情報源", "複数のweb情報源", "横断して", "調査レポート", "出典付きのレポート"]], "categories": ["deep-research"], "terms": ["deep research", "深掘り調査", "詳細調査", "調査レポート", "複数段階", "複数の情報源", "出典", "レポート"]},
    {"id": "image-generation", "groups": [["画像を作", "写真を作", "画像生成", "イラストを作", "生成画像"]], "categories": ["image-generation"], "terms": ["画像生成", "画像を作る", "写真を作る", "生成画像", "text to image"]},
    {"id": "image-editing", "groups": [["画像編集", "写真編集", "画像を直", "写真を直", "画像加工", "レタッチ"]], "categories": ["image-editing"], "terms": ["画像編集", "写真編集", "画像を直す", "写真を直す", "画像加工", "レタッチ"]},
    {"id": "presentations", "groups": [["パワポ", "powerpoint", "スライドを作", "プレゼンを作", "プレゼン資料"]], "categories": ["presentations"], "terms": ["パワポ", "powerpoint", "pptx", "スライド", "スライド作成", "プレゼン", "プレゼン資料"]},
    {"id": "voice", "groups": [["aiと話", "声で話", "声で会話", "音声会話", "音声で会話", "リアルタイムに声", "リアルタイムで声", "話しかけ"]], "categories": ["voice-conversation"], "terms": ["音声会話", "aiと話す", "声で会話", "リアルタイム会話", "話しかける", "voice", "live"]},
    {"id": "video", "groups": [["動画を作", "動画作成", "動画生成", "video"]], "categories": ["video-creation"], "terms": ["動画", "動画作成", "動画生成", "video"]},
    {"id": "automation", "groups": [["毎日", "定期", "指定時刻", "スケジュール", "自動で実行"]], "categories": ["automation"], "terms": ["毎日", "定期", "指定時刻", "スケジュール", "scheduled", "task"]},
]

PRODUCT_SEARCH_GROUPS = [
    ("Claude Code", ["claude code"]),
    ("Microsoft Copilot", ["microsoft copilot", "copilot"]),
    ("ChatGPT", ["chatgpt"]),
    ("Claude", ["claude"]),
    ("Gemini", ["gemini"]),
    ("Perplexity", ["perplexity"]),
    ("Codex", ["codex"]),
]

STOP_TOKENS = {
    "ai", "できる", "できます", "したい", "ほしい", "欲しい", "知りたい", "比較したい",
    "です", "ます", "どの", "どれ", "か", "を", "に", "で", "と", "や", "も", "の",
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def normalize(value):
    text = unicodedata.normalize("NFKC", str(value or "")).lower()
    return re.sub(r"[\s\u3000]+", " ", text).strip()


def compact(value):
    return re.sub(r"\s+", "", normalize(value))


def matched_concepts(query):
    query_compact = compact(query)
    found = []
    for concept in SEARCH_CONCEPTS:
        if all(any(compact(term) in query_compact for term in group) for group in concept["groups"]):
            found.append(concept)
    return found


def mentioned_products(query):
    value = normalize(query)
    compact_value = compact(query)
    found = []
    for name, triggers in PRODUCT_SEARCH_GROUPS:
        matches = any(normalize(trigger) in value or compact(trigger) in compact_value for trigger in triggers)
        if not matches:
            continue
        if name == "Claude" and "Claude Code" in found:
            continue
        found.append(name)
    return found


def primary_text(record):
    values = [
        record.get("id"),
        record.get("question"),
        record.get("question_ja"),
        record.get("category"),
        *(record.get("search_terms") or []),
    ]
    for answer in record.get("answers", []):
        values.append(answer.get("product"))
    return normalize(" ".join(str(value) for value in values if value))


def secondary_text(record):
    values = [
        (record.get("demand") or {}).get("summary"),
        (record.get("demand") or {}).get("summary_ja"),
    ]
    for answer in record.get("answers", []):
        values.extend([answer.get("summary"), answer.get("summary_ja")])
    return normalize(" ".join(str(value) for value in values if value))


def query_tokens(query):
    parts = re.split(r"[\s、。・,./／()（）「」『』：:!?！？]+", normalize(query))
    return [part for part in parts if len(part) >= 2 and part not in STOP_TOKENS]


def score_record(record, query, concepts):
    primary = primary_text(record)
    secondary = secondary_text(record)
    question = normalize(" ".join(v for v in [record.get("question_ja"), record.get("question")] if v))
    search_terms = normalize(" ".join(record.get("search_terms") or []))
    category_concepts = [c for c in concepts if record.get("category") in c["categories"]]

    if concepts and not category_concepts:
        return None

    score = 0
    for concept in category_concepts:
        score += 100
        for term in concept["terms"]:
            term = normalize(term)
            if term in question:
                score += 8
            elif term in search_terms:
                score += 6
            elif term in secondary:
                score += 1

    tokens = query_tokens(query)
    if not concepts and tokens:
        matches = [token for token in tokens if token in primary]
        needed = len(tokens) if len(tokens) <= 2 else max(1, math.ceil(len(tokens) * 0.6))
        if len(matches) < needed:
            return None
        score += len(matches) * 12

    for token in tokens:
        if token in question:
            score += 5
        elif token in search_terms:
            score += 3
        elif token in secondary:
            score += 1

    if compact(question).find(compact(query)) >= 0:
        score += 20
    return score


def search(records, query):
    concepts = matched_concepts(query)
    products = mentioned_products(query)
    ranked = []
    for record in records:
        if products and not any(answer.get("product") in products for answer in record.get("answers", [])):
            continue
        score = score_record(record, query, concepts)
        if score is None:
            continue
        if not concepts and not normalize(query):
            continue
        ranked.append((score, record["id"]))

    ranked.sort(key=lambda pair: (-pair[0], pair[1]))
    return [record_id for _, record_id in ranked]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cases", type=Path, default=DEFAULT_CASES)
    args = parser.parse_args()

    records = [
        load_json(path)
        for path in sorted(DATA_DIR.glob("*.json"))
        if path.is_file()
    ]
    by_id = {record["id"]: record for record in records}
    failures = 0

    payload = load_json(args.cases)
    for case in payload["cases"]:
        query = case["query"]
        found = search(records, query)
        missing = [record_id for record_id in case.get("must_include", []) if record_id not in found]
        forbidden = [record_id for record_id in case.get("must_exclude", []) if record_id in found]
        unknown = [
            record_id
            for record_id in case.get("must_include", []) + case.get("must_exclude", [])
            if record_id not in by_id
        ]

        if missing or forbidden or unknown:
            failures += 1
            print(f"FAIL {query!r} -> {found}", file=sys.stderr)
            if missing:
                print(f"  missing required: {missing}", file=sys.stderr)
            if forbidden:
                print(f"  included forbidden: {forbidden}", file=sys.stderr)
            if unknown:
                print(f"  unknown case ids: {unknown}", file=sys.stderr)
        else:
            print(f"OK   {query!r} -> {found}")

    if failures:
        print(f"Search regression failed: {failures} case(s).", file=sys.stderr)
        return 1

    print(f"Search regression passed: {len(payload['cases'])} case(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
