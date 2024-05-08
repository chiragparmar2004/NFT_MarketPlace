import { http, createConfig } from "@wagmi/core";
import { localhost } from "@wagmi/core/chains";

export const config = createConfig({
  chains: [localhost],
  transports: {
    [localhost.id]: http("http://localhost:8545"),
  },
});
