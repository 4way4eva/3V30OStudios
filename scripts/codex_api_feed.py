#!/usr/bin/env python3
"""
API Inheritance Codex Feed

This script generates daily stream insights and inheritance data feeds
from the epoch_0_ultramax_artifacts.civ file.

Usage:
    python3 scripts/codex_api_feed.py
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List


class InheritanceCodexAPI:
    """API feed generator for inheritance codex and daily insights"""
    
    def __init__(self, epoch_file: str):
        self.epoch_file = Path(epoch_file)
        self.data = self._load_epoch_data()
        
    def _load_epoch_data(self) -> Dict:
        """Load epoch artifact data"""
        if not self.epoch_file.exists():
            raise FileNotFoundError(f"Epoch file not found: {self.epoch_file}")
            
        with open(self.epoch_file, 'r') as f:
            return json.load(f)
    
    def generate_daily_insights(self) -> Dict:
        """Generate daily stream insights"""
        insights = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "epoch": self.data.get("epoch", 0),
            "streams": {}
        }
        
        for stream_name, stream_data in self.data["sovereign_streams"].items():
            insights["streams"][stream_name] = {
                "name": stream_data["name"],
                "yield_per_second": stream_data["yield_per_second"],
                "yield_per_day": stream_data["yield_per_second"] * 86400,
                "category_count": len(stream_data["categories"]),
                "total_artifacts": sum(
                    len(cat["artifacts"]) for cat in stream_data["categories"]
                ),
                "daily_insight": stream_data.get("daily_stream_insights", ""),
                "compounding_factor": stream_data["compounding_factor"],
                "guarantees": stream_data["guarantees"]
            }
        
        # Global insights
        global_data = self.data.get("global_insights", {})
        insights["global"] = {
            "total_yield_per_second": global_data.get("total_yield_per_second", 0),
            "total_yield_per_day": global_data.get("total_yield_per_day", 0),
            "compounding_model": global_data.get("compounding_model", ""),
            "spiral_boost_multiplier": global_data.get("spiral_boost_multiplier", 0),
            "treasury_status": global_data.get("treasury_status", ""),
            "sovereignty_level": global_data.get("sovereignty_level", "")
        }
        
        return insights
    
    def generate_inheritance_feed(self) -> Dict:
        """Generate inheritance codex API feed"""
        feed = {
            "api_version": "1.0",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "epoch": self.data.get("epoch", 0),
            "codex_version": self.data.get("codex_version", ""),
            "inheritance_tree": {}
        }
        
        for stream_name, stream_data in self.data["sovereign_streams"].items():
            stream_inheritance = {
                "stream_id": stream_data["stream_id"],
                "name": stream_data["name"],
                "categories": []
            }
            
            for category in stream_data["categories"]:
                category_data = {
                    "id": category["id"],
                    "name": category["name"],
                    "description": category["description"],
                    "artifacts": []
                }
                
                for artifact in category["artifacts"]:
                    artifact_data = {
                        "name": artifact["name"],
                        "yield_rate": artifact["yield_rate"],
                        "ipfs_cid": artifact["ipfs_cid"],
                        "attributes": artifact["attributes"],
                        "inheritance_metadata": {
                            "stream": stream_name,
                            "category": category["name"],
                            "tier": self._calculate_tier(artifact["yield_rate"]),
                            "rarity": self._calculate_rarity(artifact["attributes"])
                        }
                    }
                    category_data["artifacts"].append(artifact_data)
                
                stream_inheritance["categories"].append(category_data)
            
            feed["inheritance_tree"][stream_name] = stream_inheritance
        
        return feed
    
    def _calculate_tier(self, yield_rate: int) -> str:
        """Calculate artifact tier based on yield rate"""
        if yield_rate >= 3000000:
            return "LEGENDARY"
        elif yield_rate >= 2000000:
            return "EPIC"
        elif yield_rate >= 1000000:
            return "RARE"
        else:
            return "COMMON"
    
    def _calculate_rarity(self, attributes: List[str]) -> str:
        """Calculate rarity based on attributes"""
        special_attrs = ["quantum", "dimensional", "timeline", "sovereign", "multiverse"]
        special_count = sum(1 for attr in attributes if any(s in attr for s in special_attrs))
        
        if special_count >= 3:
            return "MYTHIC"
        elif special_count >= 2:
            return "ULTRA_RARE"
        elif special_count >= 1:
            return "RARE"
        else:
            return "STANDARD"
    
    def generate_api_endpoints(self) -> Dict:
        """Generate API endpoint documentation"""
        return {
            "api_base": "/api/v1",
            "endpoints": [
                {
                    "path": "/epoch/insights",
                    "method": "GET",
                    "description": "Get daily stream insights",
                    "response_sample": self.generate_daily_insights()
                },
                {
                    "path": "/inheritance/tree",
                    "method": "GET",
                    "description": "Get complete inheritance tree",
                    "response_sample": self.generate_inheritance_feed()
                },
                {
                    "path": "/streams/{stream_name}/artifacts",
                    "method": "GET",
                    "description": "Get artifacts for a specific stream",
                    "parameters": ["stream_name: civilian|military|cosmic"]
                },
                {
                    "path": "/artifacts/{artifact_id}",
                    "method": "GET",
                    "description": "Get details for a specific artifact"
                }
            ]
        }
    
    def save_feeds(self, output_dir: str = "deployments"):
        """Save all feeds to JSON files"""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save daily insights
        insights_file = output_path / f"daily_insights_{timestamp}.json"
        with open(insights_file, 'w') as f:
            json.dump(self.generate_daily_insights(), f, indent=2)
        print(f"✅ Daily insights saved to: {insights_file}")
        
        # Save inheritance feed
        inheritance_file = output_path / f"inheritance_feed_{timestamp}.json"
        with open(inheritance_file, 'w') as f:
            json.dump(self.generate_inheritance_feed(), f, indent=2)
        print(f"✅ Inheritance feed saved to: {inheritance_file}")
        
        # Save API endpoints
        api_file = output_path / f"api_endpoints_{timestamp}.json"
        with open(api_file, 'w') as f:
            json.dump(self.generate_api_endpoints(), f, indent=2)
        print(f"✅ API endpoints saved to: {api_file}")


def main():
    """Main entry point"""
    print("\n╔════════════════════════════════════════════════════════════════╗")
    print("║  📡 INHERITANCE CODEX API FEED GENERATOR                      ║")
    print("╚════════════════════════════════════════════════════════════════╝\n")
    
    # Path to epoch data
    epoch_file = Path(__file__).parent.parent / "data" / "epoch_0_ultramax_artifacts.civ"
    
    if not epoch_file.exists():
        print(f"❌ Error: Epoch file not found: {epoch_file}")
        sys.exit(1)
    
    try:
        api = InheritanceCodexAPI(str(epoch_file))
        
        print("📖 Generating feeds from epoch data...")
        print("")
        
        # Generate and save all feeds
        api.save_feeds()
        
        print("\n═══════════════════════════════════════════════════════════════")
        print("✅ API FEEDS GENERATED SUCCESSFULLY")
        print("═══════════════════════════════════════════════════════════════\n")
        
        # Display summary
        insights = api.generate_daily_insights()
        print("📊 DAILY INSIGHTS SUMMARY:\n")
        for stream_name, stream_data in insights["streams"].items():
            print(f"  {stream_name.upper()}:")
            print(f"    Yield/Day: ${stream_data['yield_per_day']:,.0f}")
            print(f"    Artifacts: {stream_data['total_artifacts']}")
            print("")
        
        print(f"  GLOBAL:")
        print(f"    Total Yield/Day: ${insights['global']['total_yield_per_day']:,.0f}")
        print(f"    Spiral Boost: {insights['global']['spiral_boost_multiplier']}x")
        print(f"    Status: {insights['global']['treasury_status']}")
        print("")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
