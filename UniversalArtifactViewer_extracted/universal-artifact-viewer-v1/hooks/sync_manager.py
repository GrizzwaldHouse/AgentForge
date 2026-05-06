# File Header: sync_manager.py
# Purpose: Handles portable sync between documentation and development repos.

import json
import shutil
import os
import sys
from pathlib import Path

class SyncEngine:
    def __init__(self, config_file):
        with open(config_file, 'r') as f:
            self.config = json.load(f)

    def validate_boundary(self, file_path):
        # RULE: Validate boundaries and fail fast.
        if not os.path.exists(file_path):
            print(f"[ERROR] Boundary validation failed: {file_path} missing.")
            return False
        return True

    def execute_sync(self):
        source = Path(self.config['paths']['source'])
        target = Path(self.config['paths']['target'])
        
        print(f"[INFO] Initializing sync: {source} -> {target}")
        
        for item in self.config['manifest']:
            src_file = source / item
            dst_file = target / item
            
            if self.validate_boundary(src_file):
                dst_file.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src_file, dst_file)
                print(f"[DEBUG] Synced: {item}")
            else:
                if self.config.get("fail_fast", True):
                    sys.exit(1)

if __name__ == "__main__":
    # Point to the config file
    config_path = os.path.join(os.path.dirname(__file__), "..", "config", "sync_config.json")
    engine = SyncEngine(config_path)
    engine.execute_sync()
