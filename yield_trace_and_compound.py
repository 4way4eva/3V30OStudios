import datetime
import csv

# ---- PARAMETERS ----
civilian_per_sec = 13_600_000
military_per_sec = 6_100_000
cosmic_per_sec = 9_200_000
total_per_sec = civilian_per_sec + military_per_sec + cosmic_per_sec

seconds_per_day = 86400
seconds_per_quarter = 7_776_000  # 90 days

pi4 = 97.409  # pi to the 4th power

# ---- 1. LIVE QUARTER-LAW TRACE ----
def quarter_yield_streams():
    yields = []
    for day in range(1, 91):
        civil = civilian_per_sec * seconds_per_day * day
        mil = military_per_sec * seconds_per_day * day
        cos = cosmic_per_sec * seconds_per_day * day
        total = total_per_sec * seconds_per_day * day
        yields.append({
            "day": day,
            "civilian": civil,
            "military": mil,
            "cosmic": cos,
            "total": total
        })
    return yields

def write_csv(filename, yields):
    with open(filename, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["day", "civilian", "military", "cosmic", "total"])
        writer.writeheader()
        for row in yields:
            writer.writerow(row)

# ---- 2. π⁴ COMPOUNDING MODEL ----
def compound_quarters(initial, quarters, factor=pi4):
    results = []
    amount = initial
    for q in range(quarters):
        results.append({
            "quarter": q+1,
            "yield_this_quarter": amount
        })
        amount *= factor
    return results

def write_compound_csv(filename, results):
    with open(filename, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["quarter", "yield_this_quarter"])
        writer.writeheader()
        for row in results:
            writer.writerow(row)

if __name__ == "__main__":
    # 1. Generate live quarter-law trace
    yields = quarter_yield_streams()
    write_csv("quarter_law_trace.csv", yields)

    # 2. π⁴ compounding model starting from total quarter yield
    initial = total_per_sec * seconds_per_quarter
    compound = compound_quarters(initial, 4)
    write_compound_csv("pi4_compound.csv", compound)

    print("Files written: quarter_law_trace.csv, pi4_compound.csv")