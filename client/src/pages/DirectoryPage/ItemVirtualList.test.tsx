import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import { VirtualRows } from "./ItemVirtualList.tsx";

const viewport = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 800,
  bottom: 800,
  width: 800,
  height: 800,
  toJSON() {
    return this;
  },
};

describe("VirtualRows", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      viewport,
    );
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(800);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders rows when the page remounts with items already in hand", () => {
    const view = render(
      <PageCanvas title="Home">
        <VirtualRows count={3} estimateSize={56}>
          {(index) => <div>Demo {String(index + 1).padStart(2, "0")}</div>}
        </VirtualRows>
      </PageCanvas>,
    );

    expect(screen.getByText("Demo 01")).toBeInTheDocument();

    view.unmount();
    render(
      <PageCanvas title="Home">
        <VirtualRows count={3} estimateSize={56}>
          {(index) => <div>Demo {String(index + 1).padStart(2, "0")}</div>}
        </VirtualRows>
      </PageCanvas>,
    );

    expect(screen.getByText("Demo 01")).toBeInTheDocument();
    expect(screen.getByText("Demo 02")).toBeInTheDocument();
  });
});
