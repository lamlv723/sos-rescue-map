#!/usr/bin/env python3
"""
Generate mock geo JSON files for MapPoint and Region.
Usage:
  python scripts/generate_geo_mock.py --points 100 --regions 10 --out data/mock
Options:
  --points N     number of map points to generate (default 100)
  --regions M    number of regions to generate (default 5)
  --out PATH     output folder (default data/mock)
  --seed S       random seed (optional)

  example:
  python scripts/generate_geo_mock.py --points 200 --regions 20 --out data/mock --seed 42
"""
import argparse
import json
import os
import random
import uuid
from datetime import datetime, timezone

def rand_point_in_bbox(bbox):
    lng_min, lat_min, lng_max, lat_max = bbox
    lng = random.uniform(lng_min, lng_max)
    lat = random.uniform(lat_min, lat_max)
    return lat, lng

def make_square_polygon(center_lat, center_lng, half_deg):
    # return polygon coords in GeoJSON order [ [ [lng,lat], ... ] ]
    tl = (center_lng - half_deg, center_lat + half_deg)
    tr = (center_lng + half_deg, center_lat + half_deg)
    br = (center_lng + half_deg, center_lat - half_deg)
    bl = (center_lng - half_deg, center_lat - half_deg)
    # close polygon
    coords = [[ [tl[0], tl[1]], [tr[0], tr[1]], [br[0], br[1]], [bl[0], bl[1]], [tl[0], tl[1]] ]]
    return coords

def generate_regions(n, bbox, out_folder):
    regions = []
    for i in range(n):
        rid = str(uuid.uuid4())
        lat, lng = rand_point_in_bbox(bbox)
        half = random.uniform(0.01, 0.03)  # ~1-3 km roughly (in degrees)
        geom = {"type":"Polygon", "coordinates": make_square_polygon(lat, lng, half)}
        region = {
            "region_id": rid,
            "name": f"Mock Region {i+1}",
            "description": f"Auto-generated region #{i+1}",
            "geometry": geom,
            "properties": {"region_type":"OPERATION" if i%3==0 else "ADMIN", "level":"zone" if i%3==0 else "district"},
            "source": "auto-generator",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        regions.append(region)
    fp = os.path.join(out_folder, "regions.json")
    with open(fp, "w", encoding="utf-8") as f:
        json.dump(regions, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(regions)} regions to {fp}")
    return fp

def generate_map_points(n, bbox, out_folder, model_map=None):
    points = []
    types = ["SOS", "TEAM", "RESOURCE", "USER"]
    for i in range(n):
        pid = str(uuid.uuid4())
        lat, lng = rand_point_in_bbox(bbox)
        obj_type = random.choice(types) if model_map is None else random.choice(list(model_map.keys()))
        # object_id generation: pick small integer to match existing mock data ranges (1..50)
        if obj_type == "SOS":
            oid = random.randint(1, 50)
        elif obj_type == "TEAM":
            oid = random.randint(1, 20)
        elif obj_type == "RESOURCE":
            oid = random.randint(1, 20)
        elif obj_type == "USER":
            oid = random.randint(1, 25)
        else:
            oid = random.randint(1,100)
        pt = {
            "point_id": pid,
            "title": f"{obj_type} point {i+1}",
            "description": f"Auto-generated point #{i+1} for {obj_type}",
            "object_type": obj_type,
            "object_id": oid,
            "latitude": round(lat, 6),
            "longitude": round(lng, 6),
            "properties": {"status": random.choice(["PENDING","ASSIGNED","RESOLVED","AVAILABLE"]), "icon": obj_type.lower()},
            "is_public": True,
            "source": "auto-generator",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        points.append(pt)
    fp = os.path.join(out_folder, "map_points.json")
    with open(fp, "w", encoding="utf-8") as f:
        json.dump(points, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(points)} map points to {fp}")
    return fp

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--points", type=int, default=100)
    parser.add_argument("--regions", type=int, default=5)
    parser.add_argument("--out", default="data/mock")
    parser.add_argument("--seed", type=int, default=None)
    parser.add_argument("--bbox", type=float, nargs=4, metavar=('LNG_MIN','LAT_MIN','LNG_MAX','LAT_MAX'),
                        help="bounding box: lng_min lat_min lng_max lat_max", default=[106.60,10.68,106.90,10.90])
    args = parser.parse_args()
    if args.seed is not None:
        random.seed(args.seed)
    out = args.out
    os.makedirs(out, exist_ok=True)
    bbox = args.bbox
    print("Generating regions...")
    generate_regions(args.regions, bbox, out)
    print("Generating map points...")
    generate_map_points(args.points, bbox, out)
    print("Done.")

if __name__ == "__main__":
    main()
