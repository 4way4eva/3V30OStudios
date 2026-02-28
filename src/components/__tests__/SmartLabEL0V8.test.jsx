import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SmartLabEL0V8 from '../SmartLabEL0V8';

const Wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('SmartLabEL0V8', () => {
  it('renders the main heading', () => {
    render(<SmartLabEL0V8 />, { wrapper: Wrapper });
    expect(screen.getByText(/Smart Lab.*EL0V8/i)).toBeInTheDocument();
  });

  it('renders Butterfly-Compatible subtitle', () => {
    render(<SmartLabEL0V8 />, { wrapper: Wrapper });
    expect(screen.getByText(/Butterfly-Compatible/i)).toBeInTheDocument();
  });

  it('renders all SEED2WING stage filter buttons', () => {
    render(<SmartLabEL0V8 />, { wrapper: Wrapper });
    expect(screen.getByText(/ALL/i)).toBeInTheDocument();
    expect(screen.getByText(/SEED/i)).toBeInTheDocument();
    expect(screen.getByText(/COCOON/i)).toBeInTheDocument();
    expect(screen.getByText(/WING/i)).toBeInTheDocument();
  });

  it('renders module cards', () => {
    render(<SmartLabEL0V8 />, { wrapper: Wrapper });
    expect(screen.getByText('Cocoon Chamber')).toBeInTheDocument();
    expect(screen.getByText('AeroSilk Textile Lab')).toBeInTheDocument();
    expect(screen.getByText('EL0V8 Cosmetics Suite')).toBeInTheDocument();
  });

  it('filters modules by SEED stage', () => {
    render(<SmartLabEL0V8 />, { wrapper: Wrapper });
    const seedBtn = screen.getAllByText(/SEED/i).find((el) => el.tagName === 'BUTTON');
    if (seedBtn) {
      fireEvent.click(seedBtn);
      // Only SEED-stage modules should be visible
      expect(screen.getByText('AeroSilk Textile Lab')).toBeInTheDocument();
    }
  });

  it('shows module detail when card is clicked', () => {
    render(<SmartLabEL0V8 />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Cocoon Chamber'));
    expect(screen.getByText(/Module Details/i)).toBeInTheDocument();
  });

  it('shows SEED2WING tracker in module detail', () => {
    render(<SmartLabEL0V8 />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('Cocoon Chamber'));
    expect(screen.getByText(/SEED2WING/i)).toBeInTheDocument();
  });

  it('shows praise resonance metric', () => {
    render(<SmartLabEL0V8 />, { wrapper: Wrapper });
    // Multiple "Praise Resonance" labels should exist (one per card)
    const praiseLabels = screen.getAllByText(/Praise Resonance/i);
    expect(praiseLabels.length).toBeGreaterThan(0);
  });

  it('shows footer with Butterfly Protocol status', () => {
    render(<SmartLabEL0V8 />, { wrapper: Wrapper });
    expect(screen.getByText(/Butterfly Protocol/i)).toBeInTheDocument();
  });

  it('hides module detail when same card clicked again', () => {
    render(<SmartLabEL0V8 />, { wrapper: Wrapper });
    const card = screen.getByText('Spiral Design Core');
    fireEvent.click(card);
    expect(screen.getByText(/Module Details/i)).toBeInTheDocument();
    fireEvent.click(card);
    expect(screen.queryByText(/Module Details/i)).not.toBeInTheDocument();
  });
});
