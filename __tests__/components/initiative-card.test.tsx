import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { InitiativeCard } from "@/components/initiative-card";
import {
  mockInitiative,
  mockProposicion,
  mockRejectedInitiative,
} from "../fixtures/initiative";

describe("InitiativeCard", () => {
  describe("content rendering", () => {
    it("renders the initiative title", () => {
      render(<InitiativeCard initiative={mockInitiative} />);
      expect(screen.getByText(mockInitiative.title)).toBeTruthy();
    });

    it("renders the expediente", () => {
      render(<InitiativeCard initiative={mockInitiative} />);
      expect(screen.getByText(mockInitiative.expediente)).toBeTruthy();
    });

    it("renders the author", () => {
      render(<InitiativeCard initiative={mockInitiative} />);
      expect(screen.getByText(mockInitiative.author)).toBeTruthy();
    });

    it("renders the current status", () => {
      render(<InitiativeCard initiative={mockInitiative} />);
      expect(screen.getByText(mockInitiative.currentStatus)).toBeTruthy();
    });

    it("renders the presentedAt year in the date", () => {
      render(<InitiativeCard initiative={mockInitiative} />);
      // Multiple elements may contain "2026" (e.g. title + date)
      expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0);
    });
  });

  describe("type badge", () => {
    it('renders "Proyecto" badge for Proyecto type', () => {
      render(<InitiativeCard initiative={mockInitiative} />);
      expect(screen.getByText("Proyecto")).toBeTruthy();
    });

    it('renders "Proposición" badge for Proposicion type', () => {
      render(<InitiativeCard initiative={mockProposicion} />);
      expect(screen.getByText("Proposición")).toBeTruthy();
    });
  });

  describe("status styles", () => {
    it("renders without error for an approved status", () => {
      render(<InitiativeCard initiative={mockProposicion} />);
      expect(screen.getByText(mockProposicion.currentStatus)).toBeTruthy();
    });

    it("renders without error for a rejected status", () => {
      render(<InitiativeCard initiative={mockRejectedInitiative} />);
      expect(
        screen.getByText(mockRejectedInitiative.currentStatus),
      ).toBeTruthy();
    });

    it("renders without error for a committee status", () => {
      render(<InitiativeCard initiative={mockInitiative} />);
      expect(screen.getByText(mockInitiative.currentStatus)).toBeTruthy();
    });
  });

  describe("interactions", () => {
    it("calls onPress when the card is pressed", () => {
      const onPress = jest.fn();
      render(<InitiativeCard initiative={mockInitiative} onPress={onPress} />);
      fireEvent.press(screen.getByText(mockInitiative.title));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("renders without crashing when onPress is not provided", () => {
      expect(() =>
        render(<InitiativeCard initiative={mockInitiative} />),
      ).not.toThrow();
    });
  });

  describe("snapshots", () => {
    it("matches snapshot for a Proyecto initiative", () => {
      const { toJSON } = render(<InitiativeCard initiative={mockInitiative} />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot for a Proposicion initiative", () => {
      const { toJSON } = render(
        <InitiativeCard initiative={mockProposicion} />,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot for a rejected initiative", () => {
      const { toJSON } = render(
        <InitiativeCard initiative={mockRejectedInitiative} />,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
