import { describe, expect, it } from "vitest"
import { render, fireEvent } from "@testing-library/react"
import ManualEditor from "./ManualEditor"

describe("ManualEditor", () => {
  it("toggles selected color", () => {
    const { getByText } = render(<ManualEditor />)
    expect(getByText("White")).toBeInTheDocument()
    fireEvent.click(getByText("Switch color"))
    expect(getByText("Black")).toBeInTheDocument()
  })
})
