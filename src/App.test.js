import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FileValidator from "./components/FileValidator";
import userEvent from "@testing-library/user-event";

describe("File Validator", () => {
  it("should render File Validator component", () => {
    render(<FileValidator />);
  });

  it("should disable validate button on initial render", () => {
    render(<FileValidator />);
    expect(screen.getByTestId("validate-file-btn")).toBeDisabled();
  });

  it("should not display Download Report button on initial render", async () => {
    render(<FileValidator />);
    expect(screen.queryByTestId("download-report-btn")).not.toBeInTheDocument();
  });

  it("should display error message when un supported file is uploaded", async () => {
    render(<FileValidator />);

    const file = new File(["test file content"], "test.txt", {
      type: "text/plain",
    });
    await waitFor(() =>
      userEvent.upload(screen.getByTestId("input-upload-btn"), file)
    );

    expect(
      screen.getByText(/Please upload only supported file/i)
    ).toBeInTheDocument();
  });
});
