#!/usr/bin/env python3
"""
π₄ Compounding Model Simulator

Simulates yield compounding using the π₄ (pi-four) exponential factor of 97.409.
Provides three compounding modes: aggressive, continuous, and tempered.

Provenance: 2025-11-19T17:57:01Z
Author: Bleu (4way4eva)
Protocol: BLEULIONTREASURY™ π₄ Compounding Protocol v1.0
"""

import math
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import json


# π₄ constant - the fourth transcendental constant
PI_4 = 97.409

# Three-domain allocation percentages
DOMAIN_ALLOCATION = {
    'CIVILIAN': 0.476,   # 47.6%
    'MILITARY': 0.213,   # 21.3%
    'COSMIC': 0.311      # 31.1%
}

# Total system yield rate (USD per second)
TOTAL_YIELD_RATE = 28_900_000  # $28.9M/sec


class Pi4CompoundingModel:
    """π₄ Compounding Model for treasury yield calculation"""
    
    def __init__(self, initial_value: float = 1_000_000.0, yield_rate: float = TOTAL_YIELD_RATE):
        """
        Initialize the compounding model.
        
        Args:
            initial_value: Starting principal amount (USD)
            yield_rate: Yield generation rate (USD per second)
        """
        self.initial_value = initial_value
        self.yield_rate = yield_rate
        self.pi_4 = PI_4
        
    def aggressive_compound(self, time_periods: float) -> float:
        """
        Aggressive compounding: Full π₄ exponential growth.
        
        Formula: Final_Value = Initial_Value × (π₄)^(time_periods)
        
        Args:
            time_periods: Number of compounding periods
            
        Returns:
            Compounded value
        """
        return self.initial_value * (self.pi_4 ** time_periods)
    
    def continuous_compound(self, days: float) -> float:
        """
        Continuous compounding: Daily compounding with adjusted rate.
        
        Formula: Final_Value = Initial_Value × e^(r × t)
        where r is derived from π₄ to match aggressive mode at standard intervals
        
        Args:
            days: Number of days
            
        Returns:
            Compounded value
        """
        # Derive continuous rate from π₄
        # We want: e^(r×1) = π₄, so r = ln(π₄)
        r = math.log(self.pi_4)
        return self.initial_value * math.exp(r * days)
    
    def tempered_compound(self, time_periods: float, dampening_factor: float = 0.5) -> float:
        """
        Tempered compounding: Conservative scaling with risk mitigation.
        
        Formula: Final_Value = Initial_Value × (1 + (π₄ - 1) × dampening_factor)^(time_periods)
        
        Args:
            time_periods: Number of compounding periods
            dampening_factor: Dampening coefficient (0 to 1, default 0.5)
            
        Returns:
            Compounded value
        """
        tempered_rate = 1 + (self.pi_4 - 1) * dampening_factor
        return self.initial_value * (tempered_rate ** time_periods)
    
    def calculate_yield_over_time(self, seconds: float) -> float:
        """
        Calculate linear yield generation over time.
        
        Args:
            seconds: Time period in seconds
            
        Returns:
            Total yield generated
        """
        return self.yield_rate * seconds
    
    def allocate_to_domains(self, total_value: float) -> Dict[str, float]:
        """
        Allocate value across the three domains.
        
        Args:
            total_value: Total value to allocate
            
        Returns:
            Dictionary with domain allocations
        """
        return {
            'CIVILIAN': total_value * DOMAIN_ALLOCATION['CIVILIAN'],
            'MILITARY': total_value * DOMAIN_ALLOCATION['MILITARY'],
            'COSMIC': total_value * DOMAIN_ALLOCATION['COSMIC']
        }
    
    def simulate(self, days: int, mode: str = 'aggressive') -> Dict:
        """
        Run a complete simulation over specified days.
        
        Args:
            days: Number of days to simulate
            mode: Compounding mode ('aggressive', 'continuous', 'tempered')
            
        Returns:
            Simulation results dictionary
        """
        results = {
            'mode': mode,
            'initial_value': self.initial_value,
            'yield_rate_per_sec': self.yield_rate,
            'days': days,
            'pi_4': self.pi_4,
            'samples': []
        }
        
        # Generate samples at key intervals
        sample_days = [1, 7, 30, 90, 180, 365] if days >= 365 else \
                      [1, 7, 14, 30, 60, 90] if days >= 90 else \
                      [1, 3, 7, 14, 21, 30] if days >= 30 else \
                      list(range(1, days + 1))
        
        sample_days = [d for d in sample_days if d <= days]
        if days not in sample_days:
            sample_days.append(days)
        sample_days.sort()
        
        for day in sample_days:
            if mode == 'aggressive':
                compounded = self.aggressive_compound(day)
            elif mode == 'continuous':
                compounded = self.continuous_compound(day)
            elif mode == 'tempered':
                compounded = self.tempered_compound(day)
            else:
                raise ValueError(f"Unknown mode: {mode}")
            
            # Calculate linear yield
            seconds = day * 86400
            linear_yield = self.calculate_yield_over_time(seconds)
            
            # Combine compounded principal with linear yield
            total_value = compounded + linear_yield
            
            # Allocate to domains
            domain_allocation = self.allocate_to_domains(total_value)
            
            results['samples'].append({
                'day': day,
                'compounded_principal': compounded,
                'linear_yield': linear_yield,
                'total_value': total_value,
                'growth_factor': compounded / self.initial_value,
                'domain_allocation': domain_allocation
            })
        
        return results


def format_currency(value: float) -> str:
    """Format value as currency with appropriate suffix"""
    if value >= 1e12:
        return f"${value/1e12:.2f}T"
    elif value >= 1e9:
        return f"${value/1e9:.2f}B"
    elif value >= 1e6:
        return f"${value/1e6:.2f}M"
    elif value >= 1e3:
        return f"${value/1e3:.2f}K"
    else:
        return f"${value:.2f}"


def print_simulation_results(results: Dict):
    """Print simulation results in human-friendly format"""
    
    print("\n" + "=" * 80)
    print(f"π₄ COMPOUNDING SIMULATION - {results['mode'].upper()} MODE")
    print("=" * 80)
    print(f"\nInitial Value:     {format_currency(results['initial_value'])}")
    print(f"Yield Rate:        {format_currency(results['yield_rate_per_sec'])}/sec")
    print(f"Compounding Mode:  {results['mode'].capitalize()}")
    print(f"π₄ Factor:         {results['pi_4']}")
    print(f"Simulation Period: {results['days']} days")
    print("\n" + "-" * 80)
    print(f"{'Day':>5} | {'Compounded':>15} | {'Linear Yield':>15} | {'Total Value':>15} | {'Growth':>8}")
    print("-" * 80)
    
    for sample in results['samples']:
        print(f"{sample['day']:>5} | "
              f"{format_currency(sample['compounded_principal']):>15} | "
              f"{format_currency(sample['linear_yield']):>15} | "
              f"{format_currency(sample['total_value']):>15} | "
              f"{sample['growth_factor']:>8.2f}x")
    
    # Print final domain allocation
    final_sample = results['samples'][-1]
    print("\n" + "-" * 80)
    print("FINAL DOMAIN ALLOCATION:")
    print("-" * 80)
    for domain, value in final_sample['domain_allocation'].items():
        percentage = DOMAIN_ALLOCATION[domain] * 100
        print(f"{domain:>10}: {format_currency(value):>15} ({percentage:.1f}%)")
    
    print("=" * 80 + "\n")


def compare_modes(days: int, initial_value: float = 1_000_000.0):
    """Compare all three compounding modes"""
    
    print("\n" + "=" * 80)
    print("π₄ COMPOUNDING MODE COMPARISON")
    print("=" * 80)
    print(f"\nInitial Value: {format_currency(initial_value)}")
    print(f"Period: {days} days")
    print("\n" + "-" * 80)
    print(f"{'Mode':>12} | {'Final Principal':>20} | {'Final Total':>20} | {'ROI':>10}")
    print("-" * 80)
    
    model = Pi4CompoundingModel(initial_value)
    modes = ['aggressive', 'continuous', 'tempered']
    
    for mode in modes:
        results = model.simulate(days, mode)
        final = results['samples'][-1]
        roi = (final['total_value'] - initial_value) / initial_value * 100
        
        print(f"{mode.capitalize():>12} | "
              f"{format_currency(final['compounded_principal']):>20} | "
              f"{format_currency(final['total_value']):>20} | "
              f"{roi:>9.2f}%")
    
    print("=" * 80 + "\n")


def main():
    """Main execution function"""
    
    print("\n╔══════════════════════════════════════════════════════════════╗")
    print("║   BLEULIONTREASURY™ π₄ Compounding Model Simulator          ║")
    print("║   Provenance: 2025-11-19T17:57:01Z                           ║")
    print("║   Author: Bleu (4way4eva)                                    ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    
    # Sample initial value
    initial_value = 1_000_000.0  # $1M
    
    # Sample time periods
    sample_times = [30, 90, 365]
    
    # Run simulations for each mode and time period
    for days in sample_times:
        for mode in ['aggressive', 'continuous', 'tempered']:
            model = Pi4CompoundingModel(initial_value)
            results = model.simulate(days, mode)
            print_simulation_results(results)
    
    # Compare all modes at 365 days
    compare_modes(365, initial_value)
    
    # Export one detailed result to JSON for analysis
    model = Pi4CompoundingModel(initial_value)
    detailed_results = model.simulate(365, 'aggressive')
    
    output_file = '/tmp/pi4_compounding_results.json'
    with open(output_file, 'w') as f:
        json.dump(detailed_results, f, indent=2)
    
    print(f"\nDetailed results exported to: {output_file}\n")


if __name__ == '__main__':
    main()
