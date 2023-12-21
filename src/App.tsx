import React, { useMemo, useState } from "react";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  BackpackWalletAdapter,
  BraveWalletAdapter,
  CoinbaseWalletAdapter,
  ExodusWalletAdapter,
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import Frame from "./frame/Frame";
import ChatProvider from "./frame/ChatProvider";

import Home from "./pages/home/Home";
import Shuffle from "./pages/home/Shuffle";
import Duelflip from "./pages/home/Duelflip";
import Leaderboards from "./pages/leaderboards/Leaderboards";
import Profile from "./pages/profile/Profile";
import Tower from "./pages/tower/Tower";
import Jackpot from "./pages/jackpot/Jackpot";
import Coinflip from "./pages/coinflip/Coinflip";

import { AppProvider, TowerProvider } from "./contexts";

import Terms from "./Terms";

import "@solana/wallet-adapter-react-ui/styles.css";
import "flowbite";
import "swiper/css";
import "swiper/css/pagination";
import "./popup.css";
import "./swal.css";
import Referal from "./components/Referral";
import Ban from "./Ban";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Referal>
        <Frame children={null} />
      </Referal>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "shuffle",
        element: <Shuffle />,
      },
      {
        path: "duelflip",
        element: <Duelflip />,
      },
      {
        path: "jackpot/:roomID",
        element: <Jackpot />,
      },
      {
        path: "coinflip/:roomID",
        element: <Coinflip />,
      },
      {
        path: "tower",
        element: <Tower />,
      },
      {
        path: "leaderboards",
        element: <Leaderboards />,
      },
      {
        path: "profile/:publicKey",
        element: <Profile />,
      },
    ],
    errorElement: (
      <Frame>
        <div className="flex h-full w-full flex-col items-center justify-center text-center">
          <span className="text-6xl font-bold">An error occured!</span>
          <Link to="/" className="text-lg font-semibold text-mute underline">
            Return to the homepage
          </Link>
        </div>
      </Frame>
    ),
  },
]);

function App() {
  const network = WalletAdapterNetwork.Testnet;
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new TrustWalletAdapter(),
      new TorusWalletAdapter(),
      new SolletWalletAdapter(),
      new SlopeWalletAdapter(),
      new GlowWalletAdapter(),
      new ExodusWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new BraveWalletAdapter(),
      new BackpackWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network]
  );
  return (
    <ConnectionProvider endpoint={import.meta.env.VITE_RPC_HOST}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <Ban>
              <AppProvider>
                <TowerProvider>
                  <Terms>
                    <ChatProvider>
                      <RouterProvider router={router} />
                    </ChatProvider>
                  </Terms>
                </TowerProvider>
              </AppProvider>
            </Ban>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
