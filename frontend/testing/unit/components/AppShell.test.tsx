import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AppShell from '../../../src/components/AppShell'

vi.mock('../../../src/components/Sidebar', () => ({
  default: () => <div data-testid="sidebar" />,
}))

vi.mock('../../../src/components/Background', () => ({
  default: () => <div data-testid="background" />,
}))

vi.mock('../../../src/hooks/useShortcuts', () => ({
  useShortcuts: () => {},
}))

function renderAppShell() {
  return render(
    <MemoryRouter>
      <AppShell>
        <div>content</div>
      </AppShell>
    </MemoryRouter>,
  )
}

describe('AppShell mobile navigation focus trap', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('opens the mobile menu when hamburger is clicked', async () => {
    const user = userEvent.setup()
    renderAppShell()

    await user.click(screen.getByRole('button', { name: /toggle navigation menu/i }))

    expect(screen.getByRole('dialog', { name: /navigation menu/i })).toBeInTheDocument()
  })

  it('closes the mobile menu when Escape is pressed', async () => {
    const user = userEvent.setup()
    renderAppShell()

    await user.click(screen.getByRole('button', { name: /toggle navigation menu/i }))
    expect(screen.getByRole('dialog', { name: /navigation menu/i })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog', { name: /navigation menu/i })).not.toBeInTheDocument()
  })

  it('sets aria-expanded to true on hamburger button when menu is open', async () => {
    const user = userEvent.setup()
    renderAppShell()

    const button = screen.getByRole('button', { name: /toggle navigation menu/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('moves focus into the drawer when menu opens', async () => {
    const user = userEvent.setup()
    renderAppShell()

    await user.click(screen.getByRole('button', { name: /toggle navigation menu/i }))

    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      const firstFocusable = dialog.querySelector('a, button')
      expect(document.activeElement).toBe(firstFocusable)
    })
  })

  it('returns focus to hamburger button when menu closes via Escape', async () => {
    const user = userEvent.setup()
    renderAppShell()

    const button = screen.getByRole('button', { name: /toggle navigation menu/i })
    await user.click(button)
    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(document.activeElement).toBe(button)
    })
  })

  it('renders all nav items inside the drawer', async () => {
    const user = userEvent.setup()
    renderAppShell()

    await user.click(screen.getByRole('button', { name: /toggle navigation menu/i }))

    const dialog = screen.getByRole('dialog')
    const links = Array.from(dialog.querySelectorAll('a')).map((a) => a.textContent)
    expect(links).toContain('Dashboard')
    expect(links).toContain('Settings')
  })
})