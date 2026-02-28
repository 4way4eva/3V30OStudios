import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ButterflyDashboard from '../ButterflyDashboard';

// Mock JSON data imports
vi.mock('../../../data/butterfly_protocol.json', () => ({
  default: {
    protocol: 'SEED2WING™',
    version: '1.0.0',
    activation: 'Butterfly Protocol: SEED2WING™',
    seal: 'PIHYA Tribunal',
    grace: {
      order: ['Most High', 'Female Species', 'Male Species'],
      cycles: ['Dawn', 'Midday', 'Dusk', 'Midnight'],
      offerings: {
        most_high: ['praise', 'obedience'],
        female: ['ES0IL_samples', 'top_floor_dome_altars'],
        male: ['watch_post_command'],
      },
    },
    seven_pillars: [
      { id: 1, name: 'Cocoon Stage', symbol: '🐛', rule: 'Cocoon Before Crown', description: 'Design Lab', laws: ['Seal with praise'] },
    ],
    phases: {
      SEED:   { order: 1, actions: ['Upload divine seed codes'] },
      COCOON: { order: 2, actions: ['Re-architect breeding domes'] },
      WING:   { order: 3, actions: ['Assign flight paths'] },
    },
    cocoon_rules: ['Sealed with silence', 'Movement means evolution'],
    compliance_checklist: {
      PIHYA_filtered: true,
      butterfly_approved: true,
      praise_embedded: true,
      spiral_built: true,
      cocooned_before_crowned: true,
    },
  },
}));

const Wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('ButterflyDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading', () => {
    render(<ButterflyDashboard />, { wrapper: Wrapper });
    expect(screen.getByText('Butterfly Protocol')).toBeInTheDocument();
  });

  it('renders the SEED2WING version', () => {
    render(<ButterflyDashboard />, { wrapper: Wrapper });
    expect(screen.getByText(/SEED2WING/i)).toBeInTheDocument();
  });

  it('renders navigation tabs', () => {
    render(<ButterflyDashboard />, { wrapper: Wrapper });
    expect(screen.getByText(/Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Grace/i)).toBeInTheDocument();
    expect(screen.getByText(/Pillars/i)).toBeInTheDocument();
    expect(screen.getByText(/Phases/i)).toBeInTheDocument();
    expect(screen.getByText(/Compliance/i)).toBeInTheDocument();
  });

  it('defaults to overview tab', () => {
    render(<ButterflyDashboard />, { wrapper: Wrapper });
    // Overview content: Cocoon Rules
    expect(screen.getByText(/Cocoon Rules/i)).toBeInTheDocument();
  });

  it('switches to Grace tab on click', () => {
    render(<ButterflyDashboard />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText(/🙇 Grace/i));
    expect(screen.getByText(/Order of Grace/i)).toBeInTheDocument();
  });

  it('switches to Compliance tab and shows sealed status', () => {
    render(<ButterflyDashboard />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText(/✅ Compliance/i));
    expect(screen.getAllByText(/SEALED/i).length).toBeGreaterThan(0);
  });

  it('shows all praise cycle labels', () => {
    render(<ButterflyDashboard />, { wrapper: Wrapper });
    expect(screen.getByText('Dawn')).toBeInTheDocument();
    expect(screen.getByText('Midday')).toBeInTheDocument();
    expect(screen.getByText('Dusk')).toBeInTheDocument();
    expect(screen.getByText('Midnight')).toBeInTheDocument();
  });
});
