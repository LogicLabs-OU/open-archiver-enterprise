import { api } from '$lib/server/api';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    if (import.meta.env.VITE_ENTERPRISE_MODE) {
        try {
            const response = await api('/enterprise/status', event);
            const data = await response.json();
            return {
                status: data
            };
        } catch (err) {
            console.log(err)
            throw error(500, 'Failed to fetch enterprise status.');
        }
    }
};
