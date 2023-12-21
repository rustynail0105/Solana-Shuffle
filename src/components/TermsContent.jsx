import Container from "./Container";
import { useApp } from "../contexts";

const TermsContent = () => {
  const { hidePopup } = useApp();

  const handleConfirm = async () => {
    try {
      localStorage.setItem("terms", "confirmed");
      hidePopup();
    } catch {}
  };

  return (
    <Container>
      <h2 className="font-bold uppercase">Terms of Service</h2>
      <div className="!scrollbar-w-4 h-[calc(100vh-180px)] overflow-auto py-2 md:h-[500px]">
        <p className="mt-4 text-left text-base font-semibold text-mute">
          Welcome to SolanaShuffle, the premier Web3 casino on the Solana
          blockchain! We're excited to have you here and want to ensure that you
          have the best possible experience on our site. Please take a moment to
          read through our terms of service (TOS) to understand your rights and
          responsibilities while using our platform. <br />
          <br />
          <span className="font-bold">Age Restrictions:</span>
          <br />
          You must be at least 18 years old to use SolanaShuffle.
          <br />
          <br />
          Responsible Gambling:
          <br />
          We take responsible gambling very seriously and encourage our users to
          do the same. If you feel that you may be developing a gambling
          problem, we will immediately assist you to help you manage your
          gambling activity.
          <br />
          <br />
          Prohibited Jurisdictions:
          <br />
          We operate in compliance with local laws and regulations, and
          therefore prohibit the use of SolanaShuffle in certain jurisdictions.
          It is your responsibility to ensure that you are legally allowed to
          use our site before you begin gambling.
          <br />
          <br />
          Security:
          <br />
          We take security very seriously and will do our best to ensure that
          your personal and financial information remains safe and secure. We
          use advanced security protocols and encryption technologies to protect
          your data, but we cannot guarantee that our systems will be 100%
          secure at all times.
          <br />
          <br />
          Fair Play:
          <br />
          SolanaShuffle operates on a fair and transparent platform. We use
          certified and verified random number generators to ensure that our
          games are unbiased and offer an equal chance of winning to all users.
          <br />
          <br />
          Intellectual Property:
          <br />
          All content on SolanaShuffle, including logos, graphics, and text, is
          protected by copyright and intellectual property laws. You may not use
          any of our content without our express written permission.
          <br />
          <br />
          Termination of Account:
          <br />
          We reserve the right to terminate your account if we believe that you
          have violated our TOS or engaged in any fraudulent or illegal activity
          on our platform.
          <br />
          <br />
          By using SolanaShuffle, you agree to abide by these terms of service.
          We reserve the right to update our TOS at any time and will notify
          users of any changes. If you have any questions or concerns, please
          contact our support team in discord for assistance.
          <br />
        </p>
      </div>
      <button
        style={{
          background:
            "radial-gradient(132.75% 155.27% at 31.94% -11.82%, #9186FF 0%, #6D61FF 33.87%, #574AFF 91.62%)",
        }}
        className="ml-2 mt-4 flex h-11 w-32 items-center justify-center rounded-xl"
        onClick={handleConfirm}
      >
        <span className="font-bold">Confirm</span>
      </button>
    </Container>
  );
};

export default React.memo(TermsContent);
