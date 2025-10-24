#!/usr/bin/env python3
"""
EV0L + Kultural Revenue Projection System
5-Year Cashflow-Level Breakdown

This module generates revenue forecasts for the EVOL Mirror Market™ business plan
integrating Virtual Try-On, Kultural Cosmetics, EV0L Smart Shades, Mirror Market,
and EV0L Banking + Bleu-¢@$h revenue streams.
"""

import datetime
import csv
import json
from typing import Dict, List, Tuple


# ---- REVENUE STREAM DEFINITIONS ----
REVENUE_STREAMS = {
    "Virtual Try-On (AR App)": {
        "model_type": "Freemium + Upsell",
        "year_1": 350_000,
        "description": "Freemium AR app with premium features"
    },
    "Kultural Cosmetics (D2C)": {
        "model_type": "Product Sales (Skincare/Makeup)",
        "year_1": 400_000,
        "description": "Direct-to-consumer cosmetics line"
    },
    "EV0L Smart Shades (Wearables)": {
        "model_type": "Preorders + Launch Sales",
        "year_1": 100_000,
        "description": "Smart wearables with threat detection and commerce"
    },
    "EV0L Mirror Market": {
        "model_type": "VR Retail % Commission",
        "year_1": 50_000,
        "description": "Virtual reality retail platform commissions"
    },
    "EV0L Banking + Bleu-¢@$h": {
        "model_type": "Subscription & TX Fees",
        "year_1": 100_000,
        "description": "Banking services and transaction fees"
    }
}

# Growth parameters
YOY_GROWTH_RATE = 0.80  # 80% year-over-year growth
PROJECTION_YEARS = 5
START_YEAR = 2025


# ---- REVENUE PROJECTION LOGIC ----
def calculate_yearly_revenue(initial_revenue: float, year: int, growth_rate: float) -> float:
    """
    Calculate revenue for a given year using compound growth.
    
    Args:
        initial_revenue: Revenue in year 1
        year: Year number (1-5)
        growth_rate: Year-over-year growth rate (e.g., 0.80 for 80%)
    
    Returns:
        Revenue for the specified year
    """
    return initial_revenue * ((1 + growth_rate) ** (year - 1))


def generate_revenue_projections() -> List[Dict]:
    """
    Generate 5-year revenue projections for all streams.
    
    Returns:
        List of dictionaries containing year-by-year projections
    """
    projections = []
    
    for year in range(1, PROJECTION_YEARS + 1):
        year_data = {
            "year": START_YEAR + year - 1,
            "year_number": year,
            "streams": {}
        }
        
        total_revenue = 0
        
        for stream_name, stream_data in REVENUE_STREAMS.items():
            year_1_revenue = stream_data["year_1"]
            revenue = calculate_yearly_revenue(year_1_revenue, year, YOY_GROWTH_RATE)
            year_data["streams"][stream_name] = {
                "revenue": revenue,
                "model_type": stream_data["model_type"]
            }
            total_revenue += revenue
        
        year_data["total_revenue"] = total_revenue
        projections.append(year_data)
    
    return projections


def calculate_cumulative_revenue(projections: List[Dict]) -> float:
    """Calculate total cumulative revenue across all years."""
    return sum(year["total_revenue"] for year in projections)


# ---- OUTPUT GENERATION ----
def write_csv_summary(filename: str, projections: List[Dict]):
    """
    Write a summary CSV with yearly totals and key catalysts.
    
    Args:
        filename: Output CSV filename
        projections: Revenue projection data
    """
    with open(filename, "w", newline="") as f:
        fieldnames = ["Year", "Total Revenue", "YoY Growth %", "Key Catalysts"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        # Key catalysts for each year
        catalysts = {
            1: "Brand launch. Community trust. Pop-up/viral activations.",
            2: "Smart Shades launch + TikTok/IG virality.",
            3: "Full Mirror Market beta. Virtual stylists take over.",
            4: "Banking tech gains users. EV0L Coin accepted in B2B.",
            5: "Licensing + Intl. rollout. First virtual mega mall partnership."
        }
        
        for i, year_data in enumerate(projections):
            yoy_growth = YOY_GROWTH_RATE * 100 if i > 0 else 0
            writer.writerow({
                "Year": year_data["year"],
                "Total Revenue": f"${year_data['total_revenue']:,.2f}",
                "YoY Growth %": f"{yoy_growth:.0f}%" if i > 0 else "Baseline",
                "Key Catalysts": catalysts.get(year_data["year_number"], "")
            })


def write_csv_detailed(filename: str, projections: List[Dict]):
    """
    Write detailed CSV with revenue breakdown by stream.
    
    Args:
        filename: Output CSV filename
        projections: Revenue projection data
    """
    stream_names = list(REVENUE_STREAMS.keys())
    fieldnames = ["Year"] + stream_names + ["Total Revenue"]
    
    with open(filename, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for year_data in projections:
            row = {"Year": year_data["year"]}
            for stream_name in stream_names:
                revenue = year_data["streams"][stream_name]["revenue"]
                row[stream_name] = f"${revenue:,.2f}"
            row["Total Revenue"] = f"${year_data['total_revenue']:,.2f}"
            writer.writerow(row)


def write_json_report(filename: str, projections: List[Dict]):
    """
    Write comprehensive JSON report with all projection data.
    
    Args:
        filename: Output JSON filename
        projections: Revenue projection data
    """
    report = {
        "metadata": {
            "generated_at": datetime.datetime.now().isoformat(),
            "projection_period": f"{START_YEAR}-{START_YEAR + PROJECTION_YEARS - 1}",
            "growth_rate": f"{YOY_GROWTH_RATE * 100:.0f}%",
            "base_year": START_YEAR
        },
        "revenue_streams": REVENUE_STREAMS,
        "yearly_projections": projections,
        "summary": {
            "total_5_year_revenue": calculate_cumulative_revenue(projections),
            "year_1_total": projections[0]["total_revenue"],
            "year_5_total": projections[-1]["total_revenue"]
        }
    }
    
    with open(filename, "w") as f:
        json.dump(report, f, indent=2)


def write_markdown_report(filename: str, projections: List[Dict]):
    """
    Write formatted Markdown report suitable for investor presentations.
    
    Args:
        filename: Output Markdown filename
        projections: Revenue projection data
    """
    with open(filename, "w") as f:
        # Header
        f.write("# 🔥 EV0L + Kultural Revenue Projections\n\n")
        f.write("## 5-Year Cashflow-Level Breakdown\n\n")
        f.write(f"**Generated**: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("---\n\n")
        
        # Revenue Streams Overview
        f.write("## 📊 Core Revenue Streams\n\n")
        f.write("| Stream | Model Type | Year 1 Revenue |\n")
        f.write("|--------|------------|----------------|\n")
        
        for stream_name, stream_data in REVENUE_STREAMS.items():
            f.write(f"| {stream_name} | {stream_data['model_type']} | ${stream_data['year_1']:,} |\n")
        
        year_1_total = projections[0]["total_revenue"]
        f.write(f"\n**Total Year 1 Revenue**: ${year_1_total:,.0f}\n\n")
        f.write(f"**Growth Model**: {YOY_GROWTH_RATE * 100:.0f}% YoY (first-to-market with unique tech + lifestyle culture combo)\n\n")
        f.write("---\n\n")
        
        # 5-Year Growth Projection
        f.write("## 🧾 5-Year Growth with Drip-Facts\n\n")
        f.write("| Year | Revenue | What's Fueling It |\n")
        f.write("|------|---------|-------------------|\n")
        
        catalysts = {
            1: "Brand launch. Community trust. Pop-up/viral activations.",
            2: "Smart Shades launch + TikTok/IG virality.",
            3: "Full Mirror Market beta. Virtual stylists take over.",
            4: "Banking tech gains users. EV0L Coin accepted in B2B.",
            5: "Licensing + Intl. rollout. First virtual mega mall partnership."
        }
        
        for year_data in projections:
            year_num = year_data["year_number"]
            revenue = year_data["total_revenue"]
            catalyst = catalysts.get(year_num, "")
            f.write(f"| {year_data['year']} | ${revenue:,.0f} | {catalyst} |\n")
        
        f.write("\n---\n\n")
        
        # Detailed Breakdown by Stream
        f.write("## 💰 Detailed Revenue Breakdown by Stream\n\n")
        
        for stream_name in REVENUE_STREAMS.keys():
            f.write(f"### {stream_name}\n\n")
            f.write("| Year | Revenue | Growth from Previous Year |\n")
            f.write("|------|---------|---------------------------|\n")
            
            for i, year_data in enumerate(projections):
                revenue = year_data["streams"][stream_name]["revenue"]
                if i == 0:
                    growth = "Baseline"
                else:
                    prev_revenue = projections[i-1]["streams"][stream_name]["revenue"]
                    growth_amount = revenue - prev_revenue
                    growth_pct = (growth_amount / prev_revenue) * 100
                    growth = f"+${growth_amount:,.0f} ({growth_pct:.0f}%)"
                
                f.write(f"| {year_data['year']} | ${revenue:,.0f} | {growth} |\n")
            
            f.write("\n")
        
        f.write("---\n\n")
        
        # Summary Insights
        cumulative = calculate_cumulative_revenue(projections)
        year_5_revenue = projections[-1]["total_revenue"]
        
        f.write("## 🧠 Key Insights\n\n")
        f.write(f"- **5-Year Cumulative Revenue**: ${cumulative:,.0f}\n")
        f.write(f"- **Year 5 Annual Revenue**: ${year_5_revenue:,.0f}+\n")
        f.write(f"- **Average Annual Revenue**: ${cumulative / PROJECTION_YEARS:,.0f}\n")
        f.write(f"- **Revenue Multiple (Year 5 vs Year 1)**: {year_5_revenue / year_1_total:.1f}x\n\n")
        
        f.write("### 💡 Strategic Positioning\n\n")
        f.write("**You didn't pitch a product. You pitched a damn category.**\n\n")
        f.write(f"That ${year_5_revenue/1_000_000:.1f}M+ ain't even your cap. ")
        f.write("That's just your floor if execution is solid.\n\n")
        f.write("---\n\n")
        
        # Integration with Atlantis Ledger
        f.write("## 🌊 Integration with Atlantis Ledger (Phase 11)\n\n")
        f.write("This revenue projection integrates with the broader EVOL Mirror Market™ ecosystem:\n\n")
        f.write("- **Fuel Source**: Backed by Atlantis assets (≈$358.2T valuation)\n")
        f.write("- **Growth Engine**: Mirror Market mechanics enable exponential scaling\n")
        f.write("- **Strategic Levers**: ESVB, ΔTLA Coin, Superpark, EL0V8, Eye of Atlantis\n")
        f.write("- **Labor Covenant**: Worker ownership multiplies engagement and retention\n")
        f.write("- **Cultural Capital**: Bleu-Symbol licensing creates perpetual revenue streams\n\n")
        f.write("---\n\n")
        
        # Footer
        f.write("**Status**: Ready for boardroom presentation\n\n")
        f.write("**Authority**: EVOL Mirror Market™ Financial Planning Division\n\n")
        f.write("*\"Price is weapon. Mirror is shield. Labor is fuel. Overscale is gospel.\"*\n")


def generate_all_reports():
    """Generate all revenue projection reports in multiple formats."""
    print("🔥 Generating EV0L + Kultural Revenue Projections...\n")
    
    # Generate projections
    projections = generate_revenue_projections()
    
    # Output filenames
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_summary = "revenue_projections_summary.csv"
    csv_detailed = "revenue_projections_detailed.csv"
    json_file = f"revenue_projections_{timestamp}.json"
    markdown_file = f"revenue_projections_{timestamp}.md"
    
    # Generate all formats
    write_csv_summary(csv_summary, projections)
    print(f"✅ Summary CSV written: {csv_summary}")
    
    write_csv_detailed(csv_detailed, projections)
    print(f"✅ Detailed CSV written: {csv_detailed}")
    
    write_json_report(json_file, projections)
    print(f"✅ JSON report written: {json_file}")
    
    write_markdown_report(markdown_file, projections)
    print(f"✅ Markdown report written: {markdown_file}")
    
    # Display summary
    print("\n" + "="*60)
    print("📊 REVENUE PROJECTION SUMMARY")
    print("="*60)
    
    cumulative = calculate_cumulative_revenue(projections)
    year_1 = projections[0]["total_revenue"]
    year_5 = projections[-1]["total_revenue"]
    
    print(f"\nYear 1 ({START_YEAR}):     ${year_1:>15,.0f}")
    print(f"Year 5 ({START_YEAR+4}):     ${year_5:>15,.0f}")
    print(f"5-Year Total:      ${cumulative:>15,.0f}")
    print(f"\nGrowth Multiple:   {year_5/year_1:>15.1f}x")
    print(f"YoY Growth Rate:   {YOY_GROWTH_RATE*100:>15.0f}%")
    print("\n" + "="*60)
    print("\n🧠 That $10M+ ain't even your cap. That's just your floor.")
    print("💰 Ready for the boardroom. Let's go.\n")


if __name__ == "__main__":
    generate_all_reports()
