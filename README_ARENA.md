# Royal Rumble Arena Documentation

**48-Player Tournament System for MEGAZION**

## Overview

The Royal Rumble Arena is a 48-player competitive tournament system where participants stake yield-bearing ENFTs to compete for massive prize pools.

## Concept

### Arena Structure

- **48 Player Positions**: Arranged in a circular formation
- **3 Domain Sections**: Divided equally (16 players per domain)
- **Central Stake Pool**: Aggregated yield from all participants
- **Multi-Round Elimination**: Progressive rounds until one winner remains

### Domains

Players are assigned to domains based on their primary ENFT holdings:

- **CIVILIAN (Ω-CIV)**: 16 positions - Blue markers
- **MILITARY (Ω-MIL)**: 16 positions - Red markers  
- **COSMIC (Ω-COS)**: 16 positions - Purple markers

## How It Works

### Entry Requirements

**Feather Ticket Holders**:
- Spectator access only
- Cannot participate in matches
- Receive small share of prize pool (0.5%)
- Can vote on arena events

**Titan Ticket Holders**:
- Full tournament participation
- Can enter up to 3 simultaneous positions
- Receive 10% larger yield share
- Priority governance voting

### Staking Mechanism

1. **Pre-Tournament Staking**
   ```javascript
   // Stake ENFTs to enter arena
   arenaContract.stake(enftTokenId, position);
   ```

2. **Yield Accumulation**
   - All staked ENFTs contribute yield to central pool
   - Yield calculated per second using π₄ model
   - Pool grows throughout tournament

3. **Prize Distribution**
   - Winner: 50% of total pool
   - Top 3: Additional 25% split
   - Top 12: Additional 15% split
   - All participants: 10% participation reward

### Tournament Flow

#### Phase 1: Registration (24 hours)
- Players stake ENFTs and select positions
- Minimum 32 players required to start
- Registration closes when 48 positions filled

#### Phase 2: Opening Ceremony (1 hour)
- All players confirmed
- Initial pool value calculated
- Arena configuration finalized
- Live stream begins

#### Phase 3: Combat Rounds
- **Round 1-4**: Mass elimination (48 → 24 → 12 → 6)
- **Round 5-6**: Strategic play (6 → 3 → 2)
- **Final Round**: Champion match (2 → 1)

#### Phase 4: Prize Distribution
- Automatic smart contract distribution
- Winners receive yield + participation rewards
- Losers receive participation rewards
- All ENFTs returned to owners

## Arena Mechanics

### Combat System

**Yield-Based Power**:
```
Player_Power = ENFT_Yield × Domain_Multiplier × Ticket_Boost
```

**Domain Advantages**:
- CIVILIAN vs MILITARY: 1.1x advantage
- MILITARY vs COSMIC: 1.1x advantage
- COSMIC vs CIVILIAN: 1.1x advantage
- Same domain: 1.0x (neutral)

**Combat Resolution**:
```javascript
function resolveCombat(player1, player2) {
  let power1 = calculatePower(player1);
  let power2 = calculatePower(player2);
  
  // Add 10% randomness
  power1 *= (0.95 + Math.random() * 0.1);
  power2 *= (0.95 + Math.random() * 0.1);
  
  return power1 > power2 ? player1 : player2;
}
```

### Special Events

**Sudden Death** (if tournament exceeds 6 hours):
- All remaining players enter final round immediately
- Prize pool split equally among survivors

**Yield Surge** (random, 1 per tournament):
- Central pool yield temporarily doubles (5 minutes)
- Announced 30 seconds before activation
- Players can temporarily boost power

**Domain Clash** (every 2 rounds):
- Cross-domain battles get 1.5x multiplier
- Encourages strategic domain switching

## Using the Mock UI

### Access

Open `arena/royal_rumble_mock.html` in your browser.

### Features

1. **Arena Visualization**
   - See all 48 player positions
   - Color-coded by domain
   - Central stake pool display

2. **Player Selection**
   - Click any position to view details
   - See player domain, status, stake

3. **Round Simulation**
   - Click "Next Round" to simulate elimination
   - Watch players get eliminated
   - Track round progression

4. **Arena Status**
   - Active players count
   - Current round
   - Total stake value
   - Winner prize amount

### Mock Controls

```javascript
// Simulate next round
simulateRound();

// Reset arena to initial state
resetArena();

// Select specific player
selectPlayer(playerElement);
```

## Smart Contract Integration

### Arena Contract Functions

```solidity
// Enter tournament
function enterArena(uint256 enftTokenId, uint8 position) external;

// Leave before start
function leaveArena(uint256 enftTokenId) external;

// Resolve combat (oracle/VRF)
function resolveCombat(uint256 round) external;

// Claim prizes
function claimPrize() external;

// Emergency exit
function emergencyWithdraw() external;
```

### Events

```solidity
event PlayerEntered(address indexed player, uint256 tokenId, uint8 position);
event CombatResolved(uint256 round, address winner, address loser);
event TournamentComplete(address champion, uint256 prizeAmount);
event PrizeClaimed(address indexed player, uint256 amount);
```

## Prize Examples

### Example 1: Full Tournament (48 players)

**Total Staked Yield**: $1.2B/sec  
**Tournament Duration**: 4 hours  
**Total Pool Value**: $17.28T

**Prize Distribution**:
- Champion: $8.64T (50%)
- 2nd Place: $3.02T (17.5%)
- 3rd Place: $1.30T (7.5%)
- Top 12: $2.59T (15% split)
- All 48: $1.73T (10% split)

### Example 2: Quick Tournament (32 players)

**Total Staked Yield**: $800M/sec  
**Tournament Duration**: 2 hours  
**Total Pool Value**: $5.76T

**Prize Distribution**:
- Champion: $2.88T (50%)
- 2nd Place: $1.01T (17.5%)
- 3rd Place: $432B (7.5%)
- Top 8: $864B (15% split)
- All 32: $576B (10% split)

## Strategy Guide

### Optimal Strategies

1. **Early Aggression**
   - Stake high-yield ENFTs early
   - Secure preferred position
   - Build intimidation factor

2. **Domain Switching**
   - Monitor opponent domains
   - Switch to advantageous domain
   - Timing is critical

3. **Ticket Stacking**
   - Use multiple Titan tickets
   - Enter 2-3 positions
   - Diversify domain exposure

4. **Late Entry**
   - Join just before registration closes
   - Study opponent positions
   - Counter-position strategically

### Advanced Tactics

**Yield Sniping**: Enter with maximum yield ENFT at last moment  
**Domain Baiting**: Fake weak position to draw opponents  
**Alliance Formation**: Coordinate with other players (informal)  
**Surge Timing**: Save boosts for Yield Surge events

## Development Roadmap

### Phase 1: Mock UI (Complete)
- ✅ Static 48-position layout
- ✅ Basic round simulation
- ✅ Domain visualization
- ✅ Player selection

### Phase 2: Smart Contracts (Q1 2025)
- [ ] Arena contract deployment
- [ ] ENFT staking integration
- [ ] Prize distribution logic
- [ ] Chainlink VRF for randomness

### Phase 3: Full UI (Q2 2025)
- [ ] Real-time combat animations
- [ ] Live yield tracking
- [ ] Player chat/social
- [ ] Tournament history

### Phase 4: Live Tournaments (Q3 2025)
- [ ] Weekly tournaments
- [ ] Seasonal championships
- [ ] Leaderboards
- [ ] Streaming integration

## Testing

### Local Testing

```bash
# Start local Hardhat node
npx hardhat node

# Deploy arena contracts
npx hardhat run scripts/deploy_arena.ts --network localhost

# Run arena simulation
npx hardhat run scripts/simulate_arena.ts --network localhost
```

### Testnet Testing

```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy_arena.ts --network sepolia

# Create test tournament
npx hardhat run scripts/create_test_tournament.ts --network sepolia

# Simulate with test accounts
node test/arena_integration.js
```

## Security Considerations

1. **Reentrancy Protection**: All prize claims use ReentrancyGuard
2. **VRF Randomness**: Chainlink VRF for unpredictable combat
3. **Emergency Pause**: Circuit breaker for critical issues
4. **Timelock**: 48-hour delay on critical parameter changes
5. **Multisig**: Prize pool managed by 3/5 multisig

## FAQ

**Q: Can I enter multiple positions?**  
A: Yes, with Titan tickets (up to 3 positions).

**Q: What if I disconnect during tournament?**  
A: Your position remains active; combat resolved automatically.

**Q: Are prizes paid in ENFTs or tokens?**  
A: Prizes paid in yield-bearing ENFTs equivalent to USD value.

**Q: Can I withdraw early?**  
A: Only before tournament starts; no mid-tournament exits.

**Q: How is randomness ensured?**  
A: Chainlink VRF provides verifiable random outcomes.

## Support

- **Discord**: #royal-rumble channel
- **Docs**: [docs.megazion.io/arena](https://docs.megazion.io/arena)
- **Issues**: [GitHub Issues](https://github.com/4way4eva/3V30OStudios/issues)

---

**Status**: Mock UI Complete, Smart Contracts In Development  
**Last Updated**: 2024-11-11  
**Version**: 1.0.0-beta
