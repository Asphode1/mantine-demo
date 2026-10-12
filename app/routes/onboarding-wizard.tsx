import { Container } from "@mantine/core";

import { DemoHeader } from "~/components/DemoHeader";
import { OnboardingWizardDemo } from "~/demos/onboarding-wizard/OnboardingWizardDemo";
import { getDemo } from "~/demos/registry";

export const meta = () => [{ title: `${getDemo("onboarding-wizard").title} · Mantine demos` }];

export default function OnboardingWizardDemoRoute() {
  return (
    <Container size="lg" py="md">
      <DemoHeader slug="onboarding-wizard" />
      <OnboardingWizardDemo />
    </Container>
  );
}
