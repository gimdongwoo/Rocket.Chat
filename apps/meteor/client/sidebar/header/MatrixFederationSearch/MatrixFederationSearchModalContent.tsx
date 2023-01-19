import type { SelectOption } from '@rocket.chat/fuselage';
import { Box, Select, TextInput } from '@rocket.chat/fuselage';
import { useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import { useSetModal, useTranslation } from '@rocket.chat/ui-contexts';
import type { VFC, FormEvent } from 'react';
import React, { useCallback, useState, useMemo } from 'react';

import FederatedRoomList from './FederatedRoomList';
import MatrixFederationManageServersModal from './MatrixFederationManageServerModal';
import MatrixFederationSearch from './MatrixFederationSearch';

type MatrixFederationSearchModalContentProps = {
	servers: Array<{
		name: string;
		default: boolean;
		local: boolean;
	}>;
	defaultSelectedServer?: string;
};

const MatrixFederationSearchModalContent: VFC<MatrixFederationSearchModalContentProps> = ({ defaultSelectedServer, servers }) => {
	const [serverName, setServerName] = useState(() => {
		console.log('defaultSelectedServer', defaultSelectedServer);
		const defaultServer = servers.find((server) => server.name === defaultSelectedServer);
		console.log('defaultServer', defaultServer);
		return defaultServer?.name ?? servers[0].name;
	});

	const [roomName, setRoomName] = useState('');

	const setModal = useSetModal();

	const debouncedRoomName = useDebouncedValue(roomName, 400);

	const t = useTranslation();

	const serverOptions = useMemo<Array<SelectOption>>(() => servers.map((server): SelectOption => [server.name, server.name]), [servers]);

	const manageServers = useCallback(() => {
		setModal(
			<MatrixFederationManageServersModal onClickClose={() => setModal(<MatrixFederationSearch onClose={() => setModal(null)} />)} />,
		);
	}, [setModal]);

	return (
		<>
			<Box display='flex' flexDirection='row'>
				<Select mie='x4' flexGrow={0} flexShrink={4} options={serverOptions} value={serverName} onChange={setServerName} />
				<TextInput
					placeholder={t('Search_rooms')}
					flexGrow={4}
					flexShrink={0}
					value={roomName}
					onChange={(e: FormEvent<HTMLInputElement>) => setRoomName(e.currentTarget.value)}
				/>
			</Box>
			<Box is='a' display='flex' flexDirection='row' mbe='x16' onClick={manageServers}>
				{t('Manage_server_list')}
			</Box>
			<FederatedRoomList serverName={serverName} roomName={debouncedRoomName} />
		</>
	);
};

export default MatrixFederationSearchModalContent;
