import { describe, expect, it, vi } from "vitest"
import { render, fireEvent } from "@testing-library/react"
import DiceStepper from "./DiceStepper"

describe("DiceStepper", () => {
  it("increments from unknown", () => {
    const onChange = vi.fn()
    const { getAllByRole } = render(
      <DiceStepper label="Die 1" value={null} onChange={onChange} />
    )
    const buttons = getAllByRole("button")
    fireEvent.click(buttons[0])
    expect(onChange).toHaveBeenCalledWith(1)
  })
})
