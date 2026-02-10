import { useState } from 'react';
import { ComponentDemo } from '../ComponentDemo';
import {
  HoloBreadcrumb,
  HoloPagination,
  HoloSteps,
  HoloDropdown,
  HoloAnchor,
  HoloTab,
  HoloLink,
  HoloButton
} from '@/index';

export default function NavSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('tab1');

  const dropdownItems = [
    { key: 'edit', label: 'Edit', icon: '✏️' },
    { key: 'copy', label: 'Copy', icon: '📋' },
    { key: 'delete', label: 'Delete', icon: '🗑️', danger: true }
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Detail' }
  ];

  const steps = [
    { title: 'Step 1', description: 'First step' },
    { title: 'Step 2', description: 'Current step' },
    { title: 'Step 3', description: 'Next step' },
    { title: 'Step 4', description: 'Final step' }
  ];

  const anchorItems = [
    { key: 'section1', href: '#section1', title: 'Section 1' },
    { key: 'section2', href: '#section2', title: 'Section 2' },
    { key: 'section3', href: '#section3', title: 'Section 3' }
  ];

  const tabs = [
    { key: 'tab1', label: 'Tab 1', content: 'Content for tab 1' },
    { key: 'tab2', label: 'Tab 2', content: 'Content for tab 2' },
    { key: 'tab3', label: 'Tab 3', content: 'Content for tab 3' }
  ];

  return (
    <div className="space-y-8">
      <ComponentDemo id="breadcrumb" title="HoloBreadcrumb" description="Navigation breadcrumbs">
        <div className="space-y-4">
          <HoloBreadcrumb items={breadcrumbItems} />
          <HoloBreadcrumb items={breadcrumbItems} separator=">" />
        </div>
      </ComponentDemo>

      <ComponentDemo id="pagination" title="HoloPagination" description="Page navigation">
        <HoloPagination
          current={currentPage}
          total={100}
          onChange={setCurrentPage}
        />
      </ComponentDemo>

      <ComponentDemo id="steps" title="HoloSteps" description="Step indicators">
        <div className="space-y-8">
          <HoloSteps current={1} items={steps} />
          <HoloSteps current={1} items={steps.slice(0, 3)} direction="vertical" />
        </div>
      </ComponentDemo>

      <ComponentDemo id="dropdown" title="HoloDropdown" description="Dropdown menus">
        <HoloDropdown items={dropdownItems} onSelect={(key) => console.log('Selected:', key)}>
          <HoloButton variant="secondary">Actions ▼</HoloButton>
        </HoloDropdown>
      </ComponentDemo>

      <ComponentDemo id="anchor" title="HoloAnchor" description="Anchor navigation">
        <HoloAnchor items={anchorItems} />
      </ComponentDemo>

      <ComponentDemo id="tabs" title="HoloTab" description="Tab navigation">
        <div>
          <HoloTab
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabs}
          />
          <div className="mt-4 p-4 border rounded">
            {tabs.find(tab => tab.key === activeTab)?.content}
          </div>
        </div>
      </ComponentDemo>

      <ComponentDemo id="link" title="HoloLink" description="Links with different states">
        <div className="flex gap-4">
          <HoloLink href="#basic">Basic Link</HoloLink>
          <HoloLink href="https://example.com" external>External Link</HoloLink>
          <HoloLink href="#disabled" disabled>Disabled Link</HoloLink>
        </div>
      </ComponentDemo>
    </div>
  );
}