import { useState } from 'react'
import { ComponentDemo } from '../ComponentDemo'
import {
  HoloBadge,
  HoloTag,
  HoloAvatar,
  HoloTooltip,
  HoloPopover,
  HoloTable,
  HoloEmpty,
  HoloTimeline,
  HoloDescriptions,
  HoloKbd,
  GlowCard,
  StatusIndicator,
  HoloButton,
  IconButton
} from '@/index'

export default function DataSection() {
  const [tags, setTags] = useState(['cyan', 'blue', 'green'])
  const [popoverOpen, setPopoverOpen] = useState(false)

  const tableData = [
    { name: 'React', status: 'active', version: '18.2.0' },
    { name: 'Vue', status: 'stable', version: '3.3.4' },
    { name: 'Svelte', status: 'beta', version: '4.2.0' },
    { name: 'Solid', status: 'active', version: '1.7.8' }
  ]

  const tableColumns = [
    { key: 'name', title: 'Name' },
    { 
      key: 'status', 
      title: 'Status',
      render: (value: any) => <HoloTag color={value === 'active' ? 'green' : 'cyan'}>{value}</HoloTag>
    },
    { key: 'version', title: 'Version' }
  ]

  const timelineItems = [
    { title: 'Project Created', description: 'Initial setup completed', time: '2024-01-01' },
    { title: 'First Release', description: 'Version 1.0.0 published', time: '2024-02-15' },
    { title: 'Major Update', description: 'Added new features', time: '2024-03-20' },
    { title: 'Bug Fixes', description: 'Resolved critical issues', time: '2024-04-10' }
  ]

  const descriptionsData = [
    { label: 'Name', value: 'Silicon Holo' },
    { label: 'Version', value: '1.0.0' },
    { label: 'License', value: 'MIT' },
    { label: 'Author', value: 'Silicon Team' }
  ]

  return (
    <div className="space-y-8">
      <ComponentDemo id="badge" title="HoloBadge" description="Notification badges with dot and count modes">
        <div className="flex flex-wrap gap-4 items-center">
          <HoloBadge dot>
            <IconButton>
              <span className="i-carbon-notification" />
            </IconButton>
          </HoloBadge>
          <HoloBadge count={5}>
            <IconButton>
              <span className="i-carbon-email" />
            </IconButton>
          </HoloBadge>
          <HoloBadge count={100}>
            <IconButton>
              <span className="i-carbon-chat" />
            </IconButton>
          </HoloBadge>
          <HoloBadge count={5} color="cyan">
            <IconButton>
              <span className="i-carbon-star" />
            </IconButton>
          </HoloBadge>
          <HoloBadge count={3} color="error">
            <IconButton>
              <span className="i-carbon-warning" />
            </IconButton>
          </HoloBadge>
        </div>
      </ComponentDemo>

      <ComponentDemo id="tag" title="HoloTag" description="Colored tags with closable and icon variants">
        <div className="flex flex-wrap gap-4 items-center">
          <HoloTag color="cyan">Cyan</HoloTag>
          <HoloTag color="blue">Blue</HoloTag>
          <HoloTag color="green">Green</HoloTag>
          <HoloTag color="purple">Purple</HoloTag>
          <HoloTag color="error">Error</HoloTag>
          <HoloTag color="warning">Warning</HoloTag>
          <HoloTag 
            color="cyan" 
            closable 
            onClose={() => setTags(tags.filter(t => t !== 'cyan'))}
          >
            Closable
          </HoloTag>
          <HoloTag icon={<span className="i-carbon-star" />}>With Icon</HoloTag>
          <HoloTag size="sm">Small</HoloTag>
          <HoloTag size="md">Large</HoloTag>
        </div>
      </ComponentDemo>

      <ComponentDemo id="avatar" title="HoloAvatar" description="User avatars with images, fallbacks, and shapes">
        <div className="flex flex-wrap gap-4 items-center">
          <HoloAvatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Silicon" />
          <HoloAvatar alt="SC" />
          <HoloAvatar size="sm" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Small" />
          <HoloAvatar size="lg" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Large" />
          <HoloAvatar shape="square" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Square" />
        </div>
      </ComponentDemo>

      <ComponentDemo id="tooltip" title="HoloTooltip" description="Tooltips with different placements">
        <div className="flex flex-wrap gap-4 items-center">
          <HoloTooltip content="Top tooltip" placement="top">
            <HoloButton>Top</HoloButton>
          </HoloTooltip>
          <HoloTooltip content="Right tooltip" placement="right">
            <HoloButton>Right</HoloButton>
          </HoloTooltip>
          <HoloTooltip content="Bottom tooltip" placement="bottom">
            <HoloButton>Bottom</HoloButton>
          </HoloTooltip>
          <HoloTooltip content="Left tooltip" placement="left">
            <HoloButton>Left</HoloButton>
          </HoloTooltip>
        </div>
      </ComponentDemo>

      <ComponentDemo id="popover" title="HoloPopover" description="Popovers with click and hover triggers">
        <div className="flex flex-wrap gap-4 items-center">
          <HoloPopover
            content={<div className="p-4">Click popover content</div>}
            trigger="click"
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
          >
            <HoloButton>Click Trigger</HoloButton>
          </HoloPopover>
          <HoloPopover
            content={<div className="p-4">Hover popover content</div>}
            trigger="hover"
          >
            <HoloButton>Hover Trigger</HoloButton>
          </HoloPopover>
        </div>
      </ComponentDemo>

      <ComponentDemo id="table" title="HoloTable" description="Data table with custom renderers">
        <HoloTable
          data={tableData}
          columns={tableColumns}
          rowKey="name"
        />
      </ComponentDemo>

      <ComponentDemo id="empty" title="HoloEmpty" description="Empty states with custom content">
        <div className="flex flex-col gap-4">
          <HoloEmpty />
          <HoloEmpty description="No data available">
            <HoloButton variant="primary">Add Data</HoloButton>
          </HoloEmpty>
        </div>
      </ComponentDemo>

      <ComponentDemo id="timeline" title="HoloTimeline" description="Timeline with events and descriptions">
        <HoloTimeline items={timelineItems} />
      </ComponentDemo>

      <ComponentDemo id="descriptions" title="HoloDescriptions" description="Key-value descriptions with layouts">
        <div className="flex flex-col gap-4">
          <HoloDescriptions items={descriptionsData} layout="horizontal" />
          <HoloDescriptions items={descriptionsData} layout="vertical" />
        </div>
      </ComponentDemo>

      <ComponentDemo id="kbd" title="HoloKbd" description="Keyboard shortcuts display">
        <div className="flex flex-wrap gap-4 items-center">
          <HoloKbd>Ctrl+C</HoloKbd>
          <HoloKbd>Ctrl+V</HoloKbd>
          <HoloKbd>Cmd+K</HoloKbd>
        </div>
      </ComponentDemo>

      <ComponentDemo id="glow-card" title="GlowCard" description="Cards with glow effects">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlowCard variant="default">
            <div className="p-4">Default Card</div>
          </GlowCard>
          <GlowCard variant="elevated">
            <div className="p-4">Elevated Card</div>
          </GlowCard>
          <GlowCard variant="intense">
            <div className="p-4">Intense Card</div>
          </GlowCard>
        </div>
      </ComponentDemo>

      <ComponentDemo id="status-indicator" title="StatusIndicator" description="Connection status indicators">
        <div className="flex flex-wrap gap-4 items-center">
          <StatusIndicator status="connected" />
          <StatusIndicator status="connecting" />
          <StatusIndicator status="disconnected" />
          <StatusIndicator status="error" />
        </div>
      </ComponentDemo>
    </div>
  )
}