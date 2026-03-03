#!/usr/bin/env bash

uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT