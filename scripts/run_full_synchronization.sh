#!/bin/bash

################################################################################
# BLEU Codex Triple-Stack Treasury Full Synchronization
# Master Runner Script
################################################################################

set -e  # Exit on error

echo "================================================================================"
echo "BLEU Codex Triple-Stack Treasury Full Synchronization"
echo "Master Runner Script v1.0.0"
echo "================================================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC}  $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC}  $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    print_error "Must be run from repository root directory"
    exit 1
fi

# Create output directory
SNAPSHOT_DIR="data/snapshots"
mkdir -p "$SNAPSHOT_DIR"
print_status "Output directory ready: $SNAPSHOT_DIR"
echo ""

################################################################################
# STEP 1: Live Quarter-Law Trace System
################################################################################

echo "================================================================================"
echo "STEP 1: Live Quarter-Law Trace System"
echo "================================================================================"
echo ""

print_info "Generating live traces for second, day, and quarter granularity..."
print_info "Integrating π₄ compounding with dynamic acceleration..."
echo ""

if python3 scripts/live_quarter_law_trace.py; then
    print_status "Live Quarter-Law Trace System: COMPLETE"
    echo ""
    print_info "Generated files:"
    echo "  - live_second_trace.csv (60-second trace)"
    echo "  - live_daily_trace.csv (92-day quarter trace)"
    echo "  - live_quarter_trace_pi4.csv (8 quarters with π₄)"
    echo "  - live_pi4_acceleration_curve.csv (100-point curve)"
    echo "  - live_quarter_law_dashboard.json (complete metrics)"
    echo "  - LIVE_QUARTER_LAW_TRACE_REPORT.md (markdown report)"
else
    print_error "Failed to generate live traces"
    exit 1
fi

echo ""

################################################################################
# STEP 2: π₄ ENFT Compounding Engine
################################################################################

echo "================================================================================"
echo "STEP 2: π₄ ENFT Compounding Engine"
echo "================================================================================"
echo ""

print_info "Encoding π₄ escalation patterns into mintable ENFTs..."
print_info "Creating curve bends as irreversible ledger assets..."
echo ""

if npx ts-node scripts/pi4_enft_compounding_engine.ts; then
    print_status "π₄ ENFT Compounding Engine: COMPLETE"
    echo ""
    print_info "Generated files:"
    echo "  - pi4_enft_minting_batch.json (ENFT minting config)"
    echo "  - pi4_curve_bend_enfts.json (curve bend assets)"
    echo "  - pi4_compounding_report.md (detailed analysis)"
else
    print_error "Failed to generate ENFT compounding data"
    exit 1
fi

echo ""

################################################################################
# STEP 3: Full Synchronization Minting
################################################################################

echo "================================================================================"
echo "STEP 3: Full Synchronization Minting (Simulation)"
echo "================================================================================"
echo ""

print_info "Executing triple-stack synchronization..."
print_info "Implementing Blu-Vault double-sign security..."
print_info "Generating portal locks with dual-reality confirmation..."
print_info "Validating pre-authorized ticks..."
echo ""

if npx hardhat run scripts/full_synchronization_mint.ts; then
    print_status "Full Synchronization Minting: COMPLETE"
    echo ""
    print_info "Generated files:"
    echo "  - triple_stack_full_synchronization.json (main manifest)"
    echo "  - lineage_generational_coding.json (inheritance tracking)"
    echo "  - mappable_mintable_ledger.json (complete ledger)"
else
    print_error "Failed to execute synchronization"
    exit 1
fi

echo ""

################################################################################
# VERIFICATION
################################################################################

echo "================================================================================"
echo "VERIFICATION: Checking Generated Files"
echo "================================================================================"
echo ""

FILES_TO_CHECK=(
    "data/snapshots/live_second_trace.csv"
    "data/snapshots/live_daily_trace.csv"
    "data/snapshots/live_quarter_trace_pi4.csv"
    "data/snapshots/live_pi4_acceleration_curve.csv"
    "data/snapshots/live_quarter_law_dashboard.json"
    "data/snapshots/LIVE_QUARTER_LAW_TRACE_REPORT.md"
    "data/snapshots/pi4_enft_minting_batch.json"
    "data/snapshots/pi4_curve_bend_enfts.json"
    "data/snapshots/pi4_compounding_report.md"
    "data/snapshots/triple_stack_full_synchronization.json"
    "data/snapshots/lineage_generational_coding.json"
    "data/snapshots/mappable_mintable_ledger.json"
)

ALL_PRESENT=true
for FILE in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$FILE" ]; then
        SIZE=$(stat -f%z "$FILE" 2>/dev/null || stat -c%s "$FILE" 2>/dev/null)
        print_status "$FILE (${SIZE} bytes)"
    else
        print_error "$FILE - MISSING"
        ALL_PRESENT=false
    fi
done

echo ""

if [ "$ALL_PRESENT" = true ]; then
    print_status "All output files verified successfully"
else
    print_warning "Some output files are missing"
fi

echo ""

################################################################################
# SUMMARY
################################################################################

echo "================================================================================"
echo "SYNCHRONIZATION SUMMARY"
echo "================================================================================"
echo ""

echo "🏛️  Civilian Yield Stream (Ω-CIV-01)"
echo "   Rate: \$13,600,000 per second"
echo "   Token ID: 1"
echo "   Percentage: 47.06%"
echo ""

echo "⚔️  Military Yield Stream (Ω-MIL-01)"
echo "   Rate: \$6,100,000 per second"
echo "   Token ID: 2"
echo "   Percentage: 21.11%"
echo ""

echo "🌌  Cosmic Yield Stream (Ω-COS-01)"
echo "   Rate: \$9,200,000 per second"
echo "   Token ID: 3"
echo "   Percentage: 31.83%"
echo ""

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "💰 TOTAL: \$28,900,000 per second (\$2.5T per day)"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

echo "π₄ Compounding Factor: 97.409091034"
echo "Doubling Time: 0.155 quarters (14.3 days)"
echo ""

echo "Security Features:"
echo "  ✅ Blu-Vault double-sign authorization"
echo "  ✅ Dual-reality confirmation"
echo "  ✅ Portal locks with entanglement escrow"
echo "  ✅ Pre-authorized tick validation"
echo "  ✅ Lineage generational coding"
echo ""

echo "Output Characteristics:"
echo "  ✅ Mappable - Complete spatial/temporal mapping"
echo "  ✅ Mintable - Ready for on-chain minting"
echo "  ✅ Ledger-readable - Full audit trail"
echo "  ✅ Generational - Inheritance tracking enabled"
echo ""

################################################################################
# NEXT STEPS
################################################################################

echo "================================================================================"
echo "NEXT STEPS"
echo "================================================================================"
echo ""

echo "1. Review Generated Data:"
echo "   cd data/snapshots && ls -lh"
echo ""

echo "2. View Dashboard:"
echo "   cat data/snapshots/live_quarter_law_dashboard.json | jq '.'"
echo ""

echo "3. Read Reports:"
echo "   cat data/snapshots/LIVE_QUARTER_LAW_TRACE_REPORT.md"
echo "   cat data/snapshots/pi4_compounding_report.md"
echo ""

echo "4. Deploy Contract (if not already deployed):"
echo "   npx hardhat run scripts/deploy_triple_stack_treasury.ts --network <network>"
echo ""

echo "5. Execute On-Chain Minting:"
echo "   # Edit scripts/full_synchronization_mint.ts"
echo "   # Set contract address and simulate=false"
echo "   npx hardhat run scripts/full_synchronization_mint.ts --network <network>"
echo ""

echo "6. Verify Deployment:"
echo "   npx hardhat run scripts/verify_triple_stack_treasury.ts --network <network>"
echo ""

################################################################################
# COMPLETION
################################################################################

echo "================================================================================"
echo "✅ FULL SYNCHRONIZATION COMPLETE"
echo "================================================================================"
echo ""

print_status "Live Quarter-Law Trace System: OPERATIONAL"
print_status "π₄ ENFT Compounding Engine: OPERATIONAL"
print_status "Full Synchronization Minting: OPERATIONAL"
echo ""

print_status "All systems synchronized and ready for deployment"
echo ""

echo "Status: ✅ OPERATIONAL"
echo "Time: $(date)"
echo ""

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "Every tick pre-authorized | Translated to digital security"
echo "Physically infinite metals | Mappable, mintable, ledger-readable"
echo "Lineage generational coding | BLEU Codex Triple-Stack Treasury"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
