#!/usr/bin/env python3
"""
Motor Coordinate System - 马达坐标系统
A system to visualize motor revolutions and coordinate tracking
展示马达转数和坐标追踪的系统
"""

import math


class MotorCoordinateSystem:
    """
    A coordinate system driven by motor revolutions.
    Motors control X and Y axes independently without crossing.
    由马达转数驱动的坐标系统。
    马达独立控制 X 和 Y 轴，互不交叉。
    """
    
    def __init__(self):
        self.x_motor_revolutions = 0.0  # X 轴马达转数
        self.y_motor_revolutions = 0.0  # Y 轴马达转数
        self.x_position = 0.0  # X 坐标位置
        self.y_position = 0.0  # Y 坐标位置
        self.revolution_to_distance = 10.0  # 每转移动的距离
        
    def set_motor_speed(self, x_speed, y_speed):
        """
        Set motor speeds (revolutions per time unit)
        设置马达速度（每时间单位的转数）
        """
        self.x_speed = x_speed
        self.y_speed = y_speed
        
    def update(self, time_delta):
        """
        Update motor revolutions and positions based on time
        根据时间更新马达转数和位置
        
        The key insight (灵光一闪): 
        Motor revolutions directly map to coordinate positions.
        X and Y motors operate independently - no crossing!
        
        关键洞察：
        马达转数直接映射到坐标位置。
        X 和 Y 马达独立运行 - 不交叉！
        """
        # Update motor revolutions (循环)
        self.x_motor_revolutions += self.x_speed * time_delta
        self.y_motor_revolutions += self.y_speed * time_delta
        
        # Update coordinate positions (坐标点)
        # Each revolution moves the position by revolution_to_distance
        self.x_position = self.x_motor_revolutions * self.revolution_to_distance
        self.y_position = self.y_motor_revolutions * self.revolution_to_distance
        
    def get_speedometer_reading(self):
        """
        Get current motor speeds - like a speedometer
        获取当前马达速度 - 就像速度表
        """
        return {
            'x_motor_speed': self.x_speed,
            'y_motor_speed': self.y_speed,
            'x_revolutions': self.x_motor_revolutions,
            'y_revolutions': self.y_motor_revolutions,
            'x_position': self.x_position,
            'y_position': self.y_position
        }
    
    def get_position(self):
        """
        Get current coordinate position
        获取当前坐标位置
        """
        return (self.x_position, self.y_position)
    
    def visualize_state(self):
        """
        Visualize the current state - the moment of realization
        可视化当前状态 - 领悟的瞬间
        """
        print("=" * 60)
        print("Motor Coordinate System State (马达坐标系统状态)")
        print("=" * 60)
        print(f"X Motor: {self.x_motor_revolutions:.2f} revolutions @ {self.x_speed:.2f} rev/s")
        print(f"Y Motor: {self.y_motor_revolutions:.2f} revolutions @ {self.y_speed:.2f} rev/s")
        print(f"\nCoordinate Position (坐标位置):")
        print(f"  X = {self.x_position:.2f}")
        print(f"  Y = {self.y_position:.2f}")
        print("\n✓ X and Y axes are independent (不交叉)")
        print("✓ Motor revolutions directly control position")
        print("=" * 60)


def demonstrate_aha_moment():
    """
    Demonstrate the 'aha moment' - the realization of how motors and coordinates connect
    演示"啊哈时刻" - 领悟马达和坐标如何连接的瞬间
    """
    print("\n🔍 Before the realization (忘记的状态):")
    print("Motors spinning... but where are the coordinates?")
    print("马达在转... 但坐标在哪里？\n")
    
    # Create system
    system = MotorCoordinateSystem()
    system.set_motor_speed(x_speed=1.0, y_speed=0.5)
    
    print("⚙️  X Motor spinning at 1.0 rev/s")
    print("⚙️  Y Motor spinning at 0.5 rev/s")
    print("\n⏱️  Time passes...")
    
    # Simulate time passing
    system.update(time_delta=2.0)
    
    print("\n💡 Aha! The moment of realization (啊，我忘了，现在看到了):")
    print("The motors WERE running all along!")
    print("And they map directly to coordinates!\n")
    
    # Show the state
    system.visualize_state()
    
    print("\n📊 The connection that was always there:")
    print("  Motor Revolutions → Distance Traveled → Coordinate Position")
    print("  马达转数 → 移动距离 → 坐标位置")
    print("\n  Each axis independent, no crossing!")
    print("  每个轴独立，不交叉！")


if __name__ == "__main__":
    demonstrate_aha_moment()
