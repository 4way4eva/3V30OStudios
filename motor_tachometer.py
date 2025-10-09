#!/usr/bin/env python3
"""
Motor Tachometer Visualization
Demonstrates the "aha moment" of understanding how X and Y motors work together.
"""

import time
import math


class MotorTachometer:
    """Visualizes motor movements and the moment of discovery."""
    
    def __init__(self):
        self.x_position = 0
        self.y_position = 0
        self.x_rotations = 0
        self.y_rotations = 0
        
    def move_to(self, target_x, target_y):
        """Move motors to target coordinates."""
        # Calculate rotation counts needed
        x_rotation_needed = target_x - self.x_position
        y_rotation_needed = target_y - self.y_position
        
        # Update rotations (motor counts)
        self.x_rotations += abs(x_rotation_needed)
        self.y_rotations += abs(y_rotation_needed)
        
        # Update positions
        self.x_position = target_x
        self.y_position = target_y
        
        return x_rotation_needed, y_rotation_needed
    
    def display_status(self, before=False):
        """Display current motor status."""
        state = "BEFORE - Unclear" if before else "NOW - Crystal Clear!"
        print(f"\n{'='*50}")
        print(f"  {state}")
        print(f"{'='*50}")
        print(f"  X Motor Position: {self.x_position:>6} | Rotations: {self.x_rotations:>6}")
        print(f"  Y Motor Position: {self.y_position:>6} | Rotations: {self.y_rotations:>6}")
        print(f"  Current Coordinate: ({self.x_position}, {self.y_position})")
        print(f"{'='*50}")
        
    def visualize_grid(self):
        """Display a simple ASCII grid showing position."""
        # Dynamically determine grid bounds to include origin and current position, with padding
        padding = 1
        min_x = min(0, self.x_position) - padding
        max_x = max(10, self.x_position) + padding
        min_y = min(0, self.y_position) - padding
        max_y = max(10, self.y_position) + padding

        print(f"\nCoordinate Grid ({min_x}-{max_x}, {min_y}-{max_y}):")
        print("  " + "".join([f"{i:>3}" for i in range(min_x, max_x + 1)]))
        
        for y in range(max_y, min_y - 1, -1):
            row = f"{y:>2} "
            for x in range(min_x, max_x + 1):
                if x == self.x_position and y == self.y_position:
                    row += " ● "  # Current position
                elif x == 0 and y == 0:
                    row += " O "  # Origin
                else:
                    row += " · "
            print(row)
        print(f"\nMotor Path: Non-crossing X and Y movement")
    
    def demonstrate_insight(self):
        """Demonstrate the 'aha moment' of understanding."""
        print("\n" + "="*60)
        print("  THE MOMENT OF DISCOVERY")
        print("  (Like catching the tachometer reading)")
        print("="*60)
        
        # Before state
        print("\n[BEFORE] Looking at the system...")
        self.display_status(before=True)
        self.visualize_grid()
        
        print("\n" + "-"*60)
        print("Moving to coordinate (5, 3)...")
        time.sleep(0.5)
        
        # The movement
        dx, dy = self.move_to(5, 3)
        print(f"X Motor: {'+' if dx >= 0 else ''}{dx} rotations")
        print(f"Y Motor: {'+' if dy >= 0 else ''}{dy} rotations")
        
        print("\n💡 AHA! Now I see it!")
        print("-"*60)
        
        # After state
        self.display_status(before=False)
        self.visualize_grid()
        
        print("\n[THE INSIGHT]")
        print("The motors were always independent (non-crossing):")
        print("  • X motor controls horizontal position")
        print("  • Y motor controls vertical position")
        print("  • Together they reach any coordinate")
        print("  • The rotation counts were always there!")
        
        # Continue with more movements
        print("\n" + "-"*60)
        print("Moving to coordinate (8, 7)...")
        time.sleep(0.5)
        dx, dy = self.move_to(8, 7)
        
        self.display_status(before=False)
        self.visualize_grid()
        
        print("\n[UNDERSTANDING ACHIEVED]")
        print("Like a tachometer showing RPM, we can now see:")
        print(f"  Total X Rotations: {self.x_rotations}")
        print(f"  Total Y Rotations: {self.y_rotations}")
        print("  The system was always running - we just caught the moment!")


def main():
    """Run the motor tachometer demonstration."""
    print("\n" + "🔧 "*20)
    print("  3V30OStudios - Motor Coordinate System")
    print("  'The Moment Between Forgetting and Discovering'")
    print("🔧 "*20)
    
    tachometer = MotorTachometer()
    tachometer.demonstrate_insight()
    
    print("\n" + "="*60)
    print("✨ That flash of insight - when it all becomes clear! ✨")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
