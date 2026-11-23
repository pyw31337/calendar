#!/usr/bin/env python3
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
now=datetime.now(timezone.utc)
paths=list((ROOT/"public-vite"/"data").glob("*.json"))
records=[]
for path in paths:
    try:
        payload=json.loads(path.read_text(encoding="utf-8"))
        if isinstance(payload,dict) and isinstance(payload.get("items"),list):
            records.extend(payload["items"])
    except (OSError,json.JSONDecodeError):
        pass
if not records:
    raise RuntimeError("calendar public data has no item arrays")
unique=len({json.dumps(item,sort_keys=True,ensure_ascii=False) for item in records})
result={"schema":"lets_observability_v1","run_id":f"calendar-{now.strftime('%Y%m%dT%H%M%SZ')}","observed_at":now.isoformat(),"service_id":"calendar","source":"persisted_calendar_data","stages":{"collect":{"status":"success","ok":len(records),"artifact":True},"analyze":{"status":"not_started","ok":None},"quality":{"status":"success" if unique==len(records) else "degraded","quality_issue_count":len(records)-unique},"publish":{"status":"success","artifact":True}},"counts":{"records":len(records)},"artifacts":{"files":len(paths)},"note":"Persisted calendar public data snapshot."}
out=ROOT/"public-vite"/"data"/"observability"/"latest.json"
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"Calendar records observed: {len(records)}")
