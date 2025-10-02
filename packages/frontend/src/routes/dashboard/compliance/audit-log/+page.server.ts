import { api } from '$lib/server/api';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { GetAuditLogsResponse } from '@open-archiver/types';

export const load: PageServerLoad = async (event) => {
    if (!event.locals.enterpriseMode) {
        throw redirect(307, '/dashboard')
    }
    try {
        // Forward search params from the page URL to the API request
        const response = await api(`/enterprise/audit-logs?${event.url.searchParams.toString()}`, event);

        if (!response.ok) {
            const error = await response.json();
            return { error: error.message, logs: [], meta: { total: 0, page: 1, limit: 20 } };
        }

        const result: GetAuditLogsResponse = await response.json();
        return {
            logs: result.data,
            meta: result.meta
        };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Unknown error',
            logs: [],
            meta: { total: 0, page: 1, limit: 20 }
        };
    }
};
