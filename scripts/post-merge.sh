#!/bin/bash
set -e
yarn install --frozen-lockfile --non-interactive
yarn workspace @workspace/db run migrate:deploy
