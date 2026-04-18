import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { FeedTypeFilter } from "@/components/feed-type-filter";

describe("FeedTypeFilter", () => {
  describe("rendering", () => {
    it('renders the "Todos" option', () => {
      render(<FeedTypeFilter selected={undefined} onSelect={jest.fn()} />);
      expect(screen.getByText("Todos")).toBeTruthy();
    });

    it('renders the "Proyectos" option', () => {
      render(<FeedTypeFilter selected={undefined} onSelect={jest.fn()} />);
      expect(screen.getByText("Proyectos")).toBeTruthy();
    });

    it('renders the "Proposiciones" option', () => {
      render(<FeedTypeFilter selected={undefined} onSelect={jest.fn()} />);
      expect(screen.getByText("Proposiciones")).toBeTruthy();
    });
  });

  describe("selection callbacks", () => {
    it('calls onSelect with undefined when "Todos" is pressed', () => {
      const onSelect = jest.fn();
      render(<FeedTypeFilter selected={undefined} onSelect={onSelect} />);
      fireEvent.press(screen.getByText("Todos"));
      expect(onSelect).toHaveBeenCalledWith(undefined);
    });

    it('calls onSelect with "Proyecto" when "Proyectos" is pressed', () => {
      const onSelect = jest.fn();
      render(<FeedTypeFilter selected={undefined} onSelect={onSelect} />);
      fireEvent.press(screen.getByText("Proyectos"));
      expect(onSelect).toHaveBeenCalledWith("Proyecto");
    });

    it('calls onSelect with "Proposicion" when "Proposiciones" is pressed', () => {
      const onSelect = jest.fn();
      render(<FeedTypeFilter selected={undefined} onSelect={onSelect} />);
      fireEvent.press(screen.getByText("Proposiciones"));
      expect(onSelect).toHaveBeenCalledWith("Proposicion");
    });

    it("calls onSelect exactly once per press", () => {
      const onSelect = jest.fn();
      render(<FeedTypeFilter selected={undefined} onSelect={onSelect} />);
      fireEvent.press(screen.getByText("Proyectos"));
      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe("active state", () => {
    it('renders without crashing when "Proyecto" is selected', () => {
      expect(() =>
        render(<FeedTypeFilter selected="Proyecto" onSelect={jest.fn()} />),
      ).not.toThrow();
    });

    it('renders without crashing when "Proposicion" is selected', () => {
      expect(() =>
        render(<FeedTypeFilter selected="Proposicion" onSelect={jest.fn()} />),
      ).not.toThrow();
    });
  });

  describe("snapshots", () => {
    it("matches snapshot with no selection", () => {
      const { toJSON } = render(
        <FeedTypeFilter selected={undefined} onSelect={jest.fn()} />,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot with "Proyecto" selected', () => {
      const { toJSON } = render(
        <FeedTypeFilter selected="Proyecto" onSelect={jest.fn()} />,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot with "Proposicion" selected', () => {
      const { toJSON } = render(
        <FeedTypeFilter selected="Proposicion" onSelect={jest.fn()} />,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
