#!/bin/bash
# Pokemon TCG API 取得進捗監視スクリプト

echo "============================================================"
echo "Pokemon TCG API バックグラウンド取得 監視ダッシュボード"
echo "============================================================"
echo ""

# 取得予定数
EXPECTED_G=1639
EXPECTED_H=2241
EXPECTED_I=1847
TOTAL_EXPECTED=$((EXPECTED_G + EXPECTED_H + EXPECTED_I))

while true; do
    # 現在時刻
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # データベース内のカード数確認
    echo "📊 データベース内ポケモンカード数:"
    docker exec -i cardnexus-postgres psql -U cardnexus_user -d cardnexus -c \
        "SELECT 
            COALESCE(\"regulationMark\", '未分類') as regulation,
            COUNT(*) as count
        FROM cards 
        WHERE \"gameTitle\" = 'ポケモンカード' 
        GROUP BY \"regulationMark\" 
        ORDER BY \"regulationMark\";" 2>/dev/null || echo "   データベース接続エラー"
    
    echo ""
    
    # ファイル取得状況確認
    echo "📁 取得データファイル:"
    if [ -f "data/pokemon-cards/regulation-G-full.json" ]; then
        G_COUNT=$(jq length data/pokemon-cards/regulation-G-full.json 2>/dev/null || echo 0)
        G_PROGRESS=$(echo "scale=1; $G_COUNT * 100 / $EXPECTED_G" | bc 2>/dev/null || echo "0.0")
        echo "   ✅ G: $G_COUNT/$EXPECTED_G枚 (${G_PROGRESS}%)"
    else
        echo "   ⏳ G: 取得中または未開始"
    fi
    
    if [ -f "data/pokemon-cards/regulation-H-full.json" ]; then
        H_COUNT=$(jq length data/pokemon-cards/regulation-H-full.json 2>/dev/null || echo 0)
        H_PROGRESS=$(echo "scale=1; $H_COUNT * 100 / $EXPECTED_H" | bc 2>/dev/null || echo "0.0")
        echo "   ✅ H: $H_COUNT/$EXPECTED_H枚 (${H_PROGRESS}%)"
    else
        echo "   ⭕ H: 未開始"
    fi
    
    if [ -f "data/pokemon-cards/regulation-I-full.json" ]; then
        I_COUNT=$(jq length data/pokemon-cards/regulation-I-full.json 2>/dev/null || echo 0)
        I_PROGRESS=$(echo "scale=1; $I_COUNT * 100 / $EXPECTED_I" | bc 2>/dev/null || echo "0.0")
        echo "   ✅ I: $I_COUNT/$EXPECTED_I枚 (${I_PROGRESS}%)"
    else
        echo "   ⭕ I: 未開始"
    fi
    
    echo ""
    echo "🎯 取得目標: $TOTAL_EXPECTED枚 (G:$EXPECTED_G, H:$EXPECTED_H, I:$EXPECTED_I)"
    echo ""
    
    # プロセス状況確認
    echo "🔄 実行中プロセス:"
    ps aux | grep -E "(fetch-.*regulation|tsx.*fetch)" | grep -v grep | head -3 || echo "   実行中プロセスなし"
    
    echo ""
    echo "============================================================"
    echo "📋 コマンド:"
    echo "   進捗確認: bash scripts/monitor-fetch.sh"
    echo "   G取得開始: npx tsx scripts/fetch-g-regulation.ts &"
    echo "   インポート: npm run import:cards"
    echo "============================================================"
    echo ""
    
    # 60秒待機
    echo "⏳ 次回更新まで60秒... (Ctrl+Cで停止)"
    sleep 60
    clear
done