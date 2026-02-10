import { ComponentDemo } from '../ComponentDemo';
import {
  HoloDivider,
  HoloSpace,
  HoloScrollArea,
  HoloCollapse,
  CircuitBorder,
  HoloButton,
  HoloInput
} from '@/index';

export default function LayoutSection() {
  const collapseItems = [
    {
      key: '1',
      title: 'Panel 1',
      content: 'Content of panel 1. This is some sample content.'
    },
    {
      key: '2',
      title: 'Panel 2',
      content: 'Content of panel 2. This panel has different content.'
    },
    {
      key: '3',
      title: 'Panel 3',
      content: 'Content of panel 3. The final panel in this example.'
    }
  ];

  const scrollItems = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

  return (
    <div className="space-y-8">
      <ComponentDemo id="divider" title="HoloDivider" description="Content dividers">
        <div className="space-y-6">
          <div>
            <p>Content above</p>
            <HoloDivider />
            <p>Content below</p>
          </div>
          <div>
            <p>Content above</p>
            <HoloDivider label="Section" />
            <p>Content below</p>
          </div>
          <div className="flex items-center gap-4">
            <span>Left</span>
            <HoloDivider orientation="vertical" />
            <span>Right</span>
          </div>
        </div>
      </ComponentDemo>

      <ComponentDemo id="space" title="HoloSpace" description="Spacing between elements">
        <div className="space-y-6">
          <div>
            <h4 className="mb-2">Horizontal spacing:</h4>
            <HoloSpace>
              <HoloButton>Button 1</HoloButton>
              <HoloButton>Button 2</HoloButton>
              <HoloButton>Button 3</HoloButton>
            </HoloSpace>
          </div>
          <div>
            <h4 className="mb-2">Vertical spacing:</h4>
            <HoloSpace direction="vertical">
              <HoloInput placeholder="Input 1" />
              <HoloInput placeholder="Input 2" />
              <HoloInput placeholder="Input 3" />
            </HoloSpace>
          </div>
          <div>
            <h4 className="mb-2">Large spacing with wrap:</h4>
            <HoloSpace size="lg" wrap>
              <HoloButton>Button A</HoloButton>
              <HoloButton>Button B</HoloButton>
              <HoloButton>Button C</HoloButton>
              <HoloButton>Button D</HoloButton>
              <HoloButton>Button E</HoloButton>
            </HoloSpace>
          </div>
        </div>
      </ComponentDemo>

      <ComponentDemo id="scroll-area" title="HoloScrollArea" description="Scrollable content areas">
        <HoloScrollArea maxHeight={200}>
          <div className="space-y-2">
            {scrollItems.map(item => (
              <div key={item} className="p-2 border rounded">
                {item} - This is some content that makes the list long enough to scroll.
              </div>
            ))}
          </div>
        </HoloScrollArea>
      </ComponentDemo>

      <ComponentDemo id="collapse" title="HoloCollapse" description="Collapsible content panels">
        <div className="space-y-6">
          <div>
            <h4 className="mb-2">Basic collapse:</h4>
            <HoloCollapse items={collapseItems} />
          </div>
          <div>
            <h4 className="mb-2">Accordion mode:</h4>
            <HoloCollapse items={collapseItems} accordion />
          </div>
        </div>
      </ComponentDemo>

      <ComponentDemo id="circuit-border" title="CircuitBorder" description="Futuristic circuit-style borders">
        <CircuitBorder>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Circuit Border</h3>
            <p>This content is wrapped in a futuristic circuit-style border that fits the Silicon Holo theme.</p>
          </div>
        </CircuitBorder>
      </ComponentDemo>
    </div>
  );
}