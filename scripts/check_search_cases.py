#!/usr/bin/env python3
"""Regression-check task search against canonical question records."""

from __future__ import annotations

import argparse
import json
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "questions"
DEFAULT_CASES = ROOT / "tests" / "search-cases.json"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


SEARCH_CONCEPTS = [
    (["pdfを読み", "pdfを読ん", "pdfの内容", "pdfを要約", "pdfを分析"], [["pdf分析", "pdf要約", "pdfを読む", "文書分析"]]),
    (["会議を文字起こし", "文字起こしした", "録音して文字起こし", "議事録を作"], [["文字起こし", "議事録", "transcription", "transcribe"]]),
    (["エクセルを編集", "excelを編集", "スプレッドシートを編集", "表計算を編集"], [["エクセル", "excel", "スプレッドシート", "表計算"], ["編集", "直接編集", "セル編集", "シート編集", "ブック編集", "更新"]]),
    (["サイトを作", "webサイト", "ウェブサイト", "ホームページを作", "webアプリ"], [["webサイト", "ウェブサイト", "ホームページ", "webアプリ", "ウェブアプリ", "webページ"]]),
    (["勉強を教え", "勉強したい", "学習したい", "家庭教師", "チューター", "フラッシュカード"], [["勉強", "学習", "家庭教師", "チューター", "クイズ", "練習問題", "フラッシュカード"]]),
    (["コードを直", "コードを修正", "バグを直", "githubのコード"], [["コード修正", "コード変更", "バグ修正", "実装", "リポジトリ", "repository"]]),
    (["ネットで調べ", "ウェブで調べ", "webで調べ", "ウェブ検索", "web検索", "ネット検索", "最新情報"], [["ウェブ検索", "web検索", "ネット検索", "現在のウェブ", "最新情報"]]),
    (["深く調べ", "深掘り", "詳細調査", "deep research"], [["deep research", "深掘り調査", "詳細調査", "調査レポート", "複数段階"]]),
    (["画像を作", "写真を作", "画像生成", "イラストを作"], [["画像生成", "画像を作る", "写真を作る", "生成画像", "text to image"]]),
    (["画像編集", "写真編集", "画像を直", "写真を直", "画像加工", "レタッチ"], [["画像編集", "写真編集", "画像を直す", "写真を直す", "画像加工", "レタッチ"]]),
    (["パワポを作", "powerpointを作", "スライドを作", "プレゼンを作"], [["パワポ", "powerpoint", "スライド作成", "プレゼン資料"]]),
    (["aiと話した", "声で話した", "音声で会話", "リアルタイムに会話", "話しかけたい"], [["音声会話", "aiと話す", "声で会話", "リアルタイム会話", "話しかける"]]),
    (["excelを分析", "エクセルを分析", "csvを分析", "データを分析", "データを見て"], [["データ分析", "excel 分析", "エクセル 分析", "csv 分析", "表計算 分析", "データを見て"], ["集計", "グラフ", "可視化", "統計", "分析"]]),
]

PRODUCT_SEARCH_GROUPS = [
    (["chatgpt"], ["chatgpt"]),
    (["claude code"], ["claude code"]),
    (["claude"], ["claude"]),
    (["gemini"], ["gemini"]),
    (["microsoft copilot", "copilot"], ["microsoft copilot", "copilot"]),
    (["perplexity"], ["perplexity"]),
    (["codex"], ["codex"]),
]


def normalize(value):
    return unicodedata.normalize("NFKC", str(value or "")).lower()


def searchable_text(record):
    values = [
        record.get("id"),
        record.get("question"),
        record.get("question_ja"),
        record.get("category"),
        *(record.get("search_terms") or []),
        (record.get("demand") or {}).get("summary"),
        (record.get("demand") or {}).get("summary_ja"),
    ]
    for answer in record.get("answers", []):
        values.extend(
            [
                answer.get("product"),
                answer.get("plan"),
                answer.get("platform"),
                answer.get("region"),
                answer.get("answer"),
                answer.get("summary"),
                answer.get("summary_ja"),
                *(answer.get("conditions") or []),
                *(answer.get("conditions_ja") or []),
                *(answer.get("limitations") or []),
                *(answer.get("limitations_ja") or []),
            ]
        )
    return normalize(" ".join(str(value) for value in values if value))


def matches(record, query):
    tokens = [token for token in normalize(query).split() if token]
    haystack = searchable_text(record)
    return all(token in haystack for token in tokens)


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
        found = [record["id"] for record in records if matches(record, query)]
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
