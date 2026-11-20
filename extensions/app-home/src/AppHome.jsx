import {render} from 'preact';
import {LocationProvider, ErrorBoundary, Router, Route} from 'preact-iso';

import ChartsPage from './pages/ChartsPage.jsx';
import ChartEditorPage from './pages/ChartEditorPage.jsx';
import RulesPage from './pages/RulesPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import InfoPage from './pages/InfoPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import BillingGate from './components/BillingGate.jsx';
import TrialBanner from './components/TrialBanner.jsx';

export default async () => {
  render(<App />, document.body);
};

function App() {
  return (
    <LocationProvider>
      <s-app-nav>
        <s-link href="/">Charts</s-link>
        <s-link href="/rules">Rules</s-link>
        <s-link href="/settings">Settings</s-link>
        <s-link href="/info">Info</s-link>
      </s-app-nav>

      <TrialBanner />

      <ErrorBoundary>
        <Router>
          <Route path="/" component={ChartsPage} />
          <Route path="/chart/:id" component={ChartEditorPage} />

          <Route path="/rules" component={() => (
            <BillingGate feature="Assignment rules">
              <RulesPage />
            </BillingGate>
          )} />

          <Route path="/settings" component={SettingsPage} />
          <Route path="/info" component={InfoPage} />
          <Route path="/pricing" component={PricingPage} />
          <Route default component={NotFoundPage} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  );
}
