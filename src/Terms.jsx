import { useEffect } from "react";

import Container from "./components/Container";
import { useApp } from "./contexts";

const Terms = ({ children }) => {
  const { setPopup, hidePopup } = useApp();

  useEffect(() => {
    const key = `terms`;
    let localSignature = localStorage.getItem(key);
    if (!localSignature) {
      setPopup({
        show: true,
        lock: true,
        html: (
          <Container>
            <span className="font-bold uppercase">Terms of Service</span>
            <span className="mt-4 max-w-[350px] text-base font-semibold text-mute">
              I confirm that gambling is not forbidden in my jurisdiction and
              that I am at least 18 years old.
            </span>
            <button
              style={{
                background:
                  "radial-gradient(132.75% 155.27% at 31.94% -11.82%, #9186FF 0%, #6D61FF 33.87%, #574AFF 91.62%)",
              }}
              className="ml-2 mt-4 flex h-11 w-32 items-center justify-center rounded-xl"
              onClick={async () => {
                try {
                  localStorage.setItem(key, "confirmed");

                  hidePopup();
                } catch {}
              }}
            >
              <span className="font-bold">Confirm</span>
            </button>
          </Container>
        ),
      });
    }
  }, []);

  return children;
};

export default Terms;
