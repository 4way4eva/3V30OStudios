import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MasterDashboard from '../MasterDashboard';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Crown:         (props) => <svg data-testid="icon-crown" {...props} />,
  Shield:        (props) => <svg data-testid="icon-shield" {...props} />,
  Coins:         (props) => <svg data-testid="icon-coins" {...props} />,
  Database:      (props) => <svg data-testid="icon-database" {...props} />,
  FileText:      (props) => <svg data-testid="icon-filetext" {...props} />,
  Zap:           (props) => <svg data-testid="icon-zap" {...props} />,
  Globe:         (props) => <svg data-testid="icon-globe" {...props} />,
  Lock:          (props) => <svg data-testid="icon-lock" {...props} />,
  CheckCircle:   (props) => <svg data-testid="icon-check" {...props} />,
  AlertTriangle: (props) => <svg data-testid="icon-warning" {...props} />,
  Activity:      (props) => <svg data-testid="icon-activity" {...props} />,
}));

const Wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;

describe('MasterDashboard', () => {
  it('renders the main title', () => {
    render(<MasterDashboard />, { wrapper: Wrapper });
    expect(screen.getByText('EV0LVERSE MASTER CONTROL')).toBeInTheDocument();
  });

  it('renders total system value', () => {
    render(<MasterDashboard />, { wrapper: Wrapper });
    expect(screen.getByText('$52.1T')).toBeInTheDocument();
  });

  it('renders all system cards', () => {
    render(<MasterDashboard />, { wrapper: Wrapper });
    expect(screen.getByText('MetaVault 5100')).toBeInTheDocument();
    expect(screen.getByText('ENFT System')).toBeInTheDocument();
    expect(screen.getByText('Sovereignty Claims')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('12 Governors')).toBeInTheDocument();
    expect(screen.getByText('Currency Systems')).toBeInTheDocument();
  });

  it('renders recent activity section', () => {
    render(<MasterDashboard />, { wrapper: Wrapper });
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText(/Treasury yield cycle completed/i)).toBeInTheDocument();
  });

  it('shows quick action buttons', () => {
    render(<MasterDashboard />, { wrapper: Wrapper });
    expect(screen.getByText('Treasury Ops')).toBeInTheDocument();
    expect(screen.getByText('ENFT Minting')).toBeInTheDocument();
    expect(screen.getByText('Legal Docs')).toBeInTheDocument();
    expect(screen.getByText('Governance')).toBeInTheDocument();
  });

  it('shows PPPPI Sealed status in footer', () => {
    render(<MasterDashboard />, { wrapper: Wrapper });
    expect(screen.getByText('PPPPI Sealed')).toBeInTheDocument();
  });

  it('opens detail panel when system card is clicked', () => {
    render(<MasterDashboard />, { wrapper: Wrapper });
    fireEvent.click(screen.getByText('MetaVault 5100'));
    expect(screen.getByText('MetaVault 5100 - Detailed View')).toBeInTheDocument();
  });

  it('closes detail panel when same card is clicked twice', () => {
    render(<MasterDashboard />, { wrapper: Wrapper });
    const card = screen.getByText('MetaVault 5100');
    fireEvent.click(card);
    expect(screen.getByText('MetaVault 5100 - Detailed View')).toBeInTheDocument();
  });
});
