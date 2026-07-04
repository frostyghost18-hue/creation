import { observer } from 'mobx-react-lite';
import ConnectionLoader from '@/components/loader/connection-loader';
import { useStore } from '@/hooks/useStore';

const BlocklyLoading = observer(() => {
    const { blockly_store } = useStore();
    const { is_loading } = blockly_store;

    if (!is_loading) return null;

    return <ConnectionLoader />;
});

export default BlocklyLoading;
