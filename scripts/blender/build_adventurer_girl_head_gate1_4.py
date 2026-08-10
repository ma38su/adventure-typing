"""Final procedural head-only Gate 1.4 revision."""
import os
import runpy
from pathlib import Path
os.environ["ADVENTURER_HEAD_GATE"]="gate1-4"
runpy.run_path(str(Path(__file__).with_name("build_adventurer_girl_head_gate1.py")),run_name="__main__")
