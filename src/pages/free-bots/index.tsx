import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { load } from '@/external/bot-skeleton';
import { save_types } from '@/external/bot-skeleton/constants/save-type';
import { useStore } from '@/hooks/useStore';
import { DBOT_TABS } from '@/constants/bot-contents';
import { LabelPairedCircleStarCaptionBoldIcon } from '@deriv/quill-icons/LabelPaired';
import { Localize } from '@deriv-com/translations';
import './free-bots.scss';

type MiniTab = 'NORMAL' | 'PREMIUM';

const MINI_TABS: MiniTab[] = ['NORMAL', 'PREMIUM'];

const TAB_CONFIG: Record<MiniTab, { badge: string; cardBorder: string }> = {
    NORMAL: {
        badge: '📊',
        cardBorder: 'linear-gradient(135deg, #f7c53b 0%, #3b82f6 50%, #f7c53b 100%)',
    },
    PREMIUM: {
        badge: '👑',
        cardBorder: 'linear-gradient(135deg, #ffd700 0%, #ff9500 50%, #ffd700 100%)',
    },
};

type BotEntry = {
    id: string;
    xml_file: string;
    name: string;
    description: string;
    tab: MiniTab;
    difficulty: string;
};

const DIFFICULTY_COLORS: Record<string, string> = {
    Beginner: '#10b981',
    Intermediate: '#f59e0b',
    Advanced: '#ef4444',
};

// ─── Add bots here ────────────────────────────────────────────────────────────
// Each entry needs: id (unique), xml_file (filename in src/xml/ without .xml),
// name, description, tab ('NORMAL' or 'PREMIUM'), difficulty ('Beginner' | 'Intermediate' | 'Advanced')
const FREE_BOTS: BotEntry[] = [];
// ─────────────────────────────────────────────────────────────────────────────

const FreeBots = observer(() => {
    const { dashboard } = useStore();
    const { setActiveTab: setDashboardTab } = dashboard;
    const [importing, setImporting] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<MiniTab>('NORMAL');

    const handleImport = async (bot: BotEntry) => {
        setImporting(bot.id);
        try {
            const xml_module = await import(`../../xml/${bot.xml_file}.xml`);
            const block_string = xml_module.default;
            const workspace = (window as any).Blockly?.derivWorkspace;

            setDashboardTab(DBOT_TABS.BOT_BUILDER);

            if (workspace) {
                await load({
                    block_string,
                    workspace,
                    file_name: bot.name,
                    from: save_types.LOCAL,
                    show_snackbar: true,
                    drop_event: undefined,
                    strategy_id: undefined,
                    showIncompatibleStrategyDialog: undefined,
                });
            } else {
                setTimeout(async () => {
                    const ws = (window as any).Blockly?.derivWorkspace;
                    if (ws) {
                        await load({
                            block_string,
                            workspace: ws,
                            file_name: bot.name,
                            from: save_types.LOCAL,
                            show_snackbar: true,
                            drop_event: undefined,
                            strategy_id: undefined,
                            showIncompatibleStrategyDialog: undefined,
                        });
                    }
                }, 800);
            }
        } catch (err) {
            console.error('Failed to import bot:', err);
        } finally {
            setImporting(null);
        }
    };

    const visible_bots = FREE_BOTS.filter(bot => bot.tab === activeTab);

    return (
        <div className='free-bots'>
            <div className='free-bots__mini-tabs'>
                {MINI_TABS.map(tab => (
                    <button
                        key={tab}
                        className={`free-bots__mini-tab${activeTab === tab ? ' free-bots__mini-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        <span className='free-bots__mini-tab-badge'>{TAB_CONFIG[tab].badge}</span>
                        {tab}
                    </button>
                ))}
            </div>

            {visible_bots.length > 0 ? (
                <div className='free-bots__grid'>
                    {visible_bots.map(bot => {
                        const is_loading = importing === bot.id;
                        const cfg = TAB_CONFIG[bot.tab];
                        return (
                            <div
                                key={bot.id}
                                className='free-bots__card'
                                style={{ '--card-border': cfg.cardBorder } as React.CSSProperties}
                            >
                                <div className='free-bots__card-icon-row'>
                                    <div className='free-bots__card-icon'>
                                        <LabelPairedCircleStarCaptionBoldIcon height='32px' width='32px' fill='#f7c53b' />
                                    </div>
                                    <span
                                        className='free-bots__card-special-tag'
                                        style={
                                            bot.tab === 'PREMIUM'
                                                ? { color: '#f7a800', background: 'rgb(247 168 0 / 12%)', borderColor: '#f7a800' + '40' }
                                                : { color: '#3b82f6', background: 'rgb(59 130 246 / 12%)', borderColor: '#3b82f6' + '40' }
                                        }
                                    >
                                        <span>{cfg.badge}</span>
                                        {bot.tab}
                                    </span>
                                </div>
                                <div className='free-bots__card-body'>
                                    <div className='free-bots__card-top'>
                                        <span className='free-bots__card-category'>{bot.tab}</span>
                                        <span
                                            className='free-bots__card-difficulty'
                                            style={{ color: DIFFICULTY_COLORS[bot.difficulty] }}
                                        >
                                            {bot.difficulty}
                                        </span>
                                    </div>
                                    <h3 className='free-bots__card-name'>{bot.name}</h3>
                                    <p className='free-bots__card-description'>{bot.description}</p>
                                </div>
                                <button
                                    className={`free-bots__card-btn${is_loading ? ' free-bots__card-btn--loading' : ''}`}
                                    onClick={() => handleImport(bot)}
                                    disabled={is_loading}
                                >
                                    {is_loading ? (
                                        <Localize i18n_default_text='Importing…' />
                                    ) : (
                                        <Localize i18n_default_text='LOAD BOT' />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className='free-bots__empty'>
                    <Localize i18n_default_text='No bots here yet. Check back soon!' />
                </div>
            )}
        </div>
    );
});

export default FreeBots;
