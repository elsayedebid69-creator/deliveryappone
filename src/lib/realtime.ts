import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to live changes on the given tables and invalidates the
 * provided react-query key prefixes whenever anything changes.
 */
export function useRealtime(tables: string[], keys: string[], channelName: string) {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel(`rt-${channelName}-${crypto.randomUUID()}`);

    for (const table of tables) {
      channel.on(
        "postgres_changes" as never,
        { event: "*", schema: "public", table },
        () => {
          for (const key of keys) {
            void qc.invalidateQueries({ queryKey: [key] });
          }
        },
      );
    }

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, tables.join(","), keys.join(","), qc]);
}
