#!/bin/bash

echo "=============================================="
echo "    开始部署 ldpt.yunzhuyang.com"
echo "=============================================="

REPO_DIR=$(pwd)
BRANCH="main"

echo ""
echo "[INFO]  Step 1: 拉取/更新代码..."

if [ -d ".git" ]; then
    echo "[INFO]  检测到已有仓库，执行 git pull..."

    # 丢弃本地修改，避免合并冲突
    echo "[INFO]  重置本地修改..."
    git checkout -- .
    git clean -fd

    # 拉取最新代码
    git pull origin "$BRANCH"
    if [ $? -ne 0 ]; then
        echo "[ERROR] git pull 失败，请检查网络或仓库配置"
        exit 1
    fi
else
    echo "[INFO]  未检测到仓库，请先克隆项目"
    exit 1
fi

echo ""
echo "[INFO]  部署完成！"
echo "=============================================="
