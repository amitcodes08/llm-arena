import { HomeScreen } from "@/features/home/home-screen";
import { castVoteAction } from "@/features/voting/cast-vote-action";
import { fetchFreeModelCatalog } from "@/infrastructure/fetch-model-catalog";
import { defaultModelSelection } from "@/infrastructure/model-catalog";

export default async function ArenaPage() {
  const catalog = await fetchFreeModelCatalog();

  return (
    <HomeScreen
      catalog={catalog}
      defaultSelection={catalog ? defaultModelSelection(catalog) : []}
      onCastVote={castVoteAction}
    />
  );
}
