import json
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.routes import get_processed_data, get_all_plants, get_plant_detail, get_all_data_quality_logs

def export():
    fleet_resp = get_all_plants()
    quality_logs_resp = get_all_data_quality_logs()
    
    plants_detail = {}
    for site_id in ["S1", "S2", "S3", "S4", "S5"]:
        detail = get_plant_detail(site_id, None, None)
        plants_detail[site_id] = detail.model_dump()
        
    export_payload = {
        "fleet": fleet_resp.model_dump(),
        "plants": plants_detail,
        "quality_logs": [log.model_dump() for log in quality_logs_resp]
    }
    
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Export to frontend
    out_dir_frontend = os.path.join(root_dir, "frontend", "src", "data")
    os.makedirs(out_dir_frontend, exist_ok=True)
    out_file_frontend = os.path.join(out_dir_frontend, "fallbackData.json")
    with open(out_file_frontend, "w", encoding="utf-8") as f:
        json.dump(export_payload, f, indent=2)
    print(f"Successfully exported fallback data to {out_file_frontend}")

    # Export to mobile
    out_dir_mobile = os.path.join(root_dir, "mobile", "src", "data")
    os.makedirs(out_dir_mobile, exist_ok=True)
    out_file_mobile = os.path.join(out_dir_mobile, "fallbackData.json")
    with open(out_file_mobile, "w", encoding="utf-8") as f:
        json.dump(export_payload, f, indent=2)
    print(f"Successfully exported fallback data to {out_file_mobile}")

if __name__ == "__main__":
    export()
