<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { t } from '$lib/translations';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import type { JobStatus } from '@open-archiver/types';

	let { data }: { data: PageData } = $props();
	let queue = $derived(data.queue);

	const jobStatuses: JobStatus[] = [
		'failed',
		'active',
		'completed',
		'delayed',
		'waiting',
		'paused',
	];

	let selectedStatus: JobStatus | undefined = $state('failed');

	function handleStatusChange(status: JobStatus) {
		selectedStatus = status;
		const url = new URL(window.location.href);
		url.searchParams.set('status', status);
		url.searchParams.set('page', '1');
		goto(url.toString(), { invalidateAll: true });
	}

	function handlePageChange(page: number) {
		const url = new URL(window.location.href);
		url.searchParams.set('page', page.toString());
		goto(url.toString(), { invalidateAll: true });
	}
</script>

<svelte:head>
	<title>{queue.name} - {$t('app.jobs.title')} - Open Archiver</title>
</svelte:head>

<div class="space-y-4">
	<a href="/dashboard/admin/jobs" class="text-primary mb-1 text-sm hover:underline">
		&larr; {$t('app.jobs.back_to_queues')}
	</a>
	<h1 class="text-2xl font-bold capitalize">{queue.name.split('_').join(' ')}</h1>

	<Card.Root>
		<Card.Header>
			<Card.Title>{$t('app.jobs.jobs')}</Card.Title>
			<div class="flex space-x-2">
				{#each jobStatuses as status}
					<Button
						variant={selectedStatus === status ? 'default' : 'outline'}
						onclick={() => handleStatusChange(status)}
						class="capitalize"
					>
						{status} ({queue.counts[status]})
					</Button>
				{/each}
			</div>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{$t('app.jobs.id')}</Table.Head>
						<Table.Head>{$t('app.jobs.name')}</Table.Head>
						<Table.Head>{$t('app.jobs.state')}</Table.Head>
						<Table.Head>{$t('app.jobs.created_at')}</Table.Head>
						<Table.Head>{$t('app.jobs.processed_at')}</Table.Head>
						<Table.Head>{$t('app.jobs.finished_at')}</Table.Head>
						<Table.Head>{$t('app.jobs.ingestion_source')}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each queue.jobs as job}
						<Table.Row>
							<Table.Cell>{job.id}</Table.Cell>
							<Table.Cell>{job.name}</Table.Cell>
							<Table.Cell class="capitalize">
								{#if job.error}
									<Button
										variant="secondary"
										size="sm"
										class="cursor-pointer capitalize"
										onclick={() => {
											if (job.error) {
												const el = document.getElementById(
													`error-${job.id}`
												);
												if (el) {
													el.classList.toggle('hidden');
												}
											}
										}}
									>
										{job.state}
									</Button>
								{:else}
									{job.state}
								{/if}
							</Table.Cell>
							<Table.Cell>{new Date(job.timestamp).toLocaleString()}</Table.Cell>
							<Table.Cell
								>{job.processedOn
									? new Date(job.processedOn).toLocaleString()
									: 'N/A'}</Table.Cell
							>
							<Table.Cell
								>{job.finishedOn
									? new Date(job.finishedOn).toLocaleString()
									: 'N/A'}</Table.Cell
							>
							<Table.Cell>
								<a
									href="/dashboard/archived-emails?ingestionSourceId={job.ingestionSourceId}"
									>{job.ingestionSourceId || 'N/A'}</a
								>
							</Table.Cell>
						</Table.Row>
						{#if job.error}
							<Table.Row id={`error-${job.id}`} class="hidden">
								<Table.Cell colspan={7}>
									<pre class="rounded-md bg-gray-100 p-4">{job.error}</pre>
								</Table.Cell>
							</Table.Row>
						{/if}
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
		<Card.Footer class="flex justify-between">
			<div>
				<p class="text-muted-foreground text-sm">
					{$t('app.jobs.showing')}
					{queue.jobs.length}
					{$t('app.jobs.of')}
					{queue.pagination.totalJobs}
					{$t('app.jobs.jobs')}
				</p>
			</div>
			<div class="flex space-x-2">
				<Button
					variant="outline"
					disabled={queue.pagination.currentPage <= 1}
					onclick={() => handlePageChange(queue.pagination.currentPage - 1)}
				>
					{$t('app.jobs.previous')}
				</Button>
				<Button
					variant="outline"
					disabled={queue.pagination.currentPage >= queue.pagination.totalPages}
					onclick={() => handlePageChange(queue.pagination.currentPage + 1)}
				>
					{$t('app.jobs.next')}
				</Button>
			</div>
		</Card.Footer>
	</Card.Root>
</div>
