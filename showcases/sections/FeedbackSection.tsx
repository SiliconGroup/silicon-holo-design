import { useState } from 'react';
import { ComponentDemo } from '../ComponentDemo';
import {
  HoloModal,
  HoloDrawer,
  HoloAlert,
  HoloProgress,
  HoloSkeleton,
  HoloSpinner,
  HexagonLoader,
  HoloButton,
  HoloSwitch,
  HoloConfirm
} from '@/index';

export default function FeedbackSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const [confirmInfo, setConfirmInfo] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [confirmWarning, setConfirmWarning] = useState(false);
  const [confirmDanger, setConfirmDanger] = useState(false);
  const [confirmHorizontal, setConfirmHorizontal] = useState(false);

  return (
    <div className="space-y-8">
      <ComponentDemo id="modal" title="HoloModal" description="Modal dialogs with customizable content">
        <HoloButton onClick={() => setModalOpen(true)}>Open Modal</HoloButton>
        <HoloModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Confirm Action"
          closable
          footer={
            <div className="flex gap-2">
              <HoloButton variant="secondary" onClick={() => setModalOpen(false)}>Cancel</HoloButton>
              <HoloButton onClick={() => setModalOpen(false)}>Confirm</HoloButton>
            </div>
          }
        >
          Are you sure you want to proceed with this action?
        </HoloModal>
      </ComponentDemo>

      <ComponentDemo id="drawer" title="HoloDrawer" description="Slide-out panels from left or right">
        <div className="flex gap-4">
          <HoloButton onClick={() => setLeftDrawerOpen(true)}>Left Drawer</HoloButton>
          <HoloButton onClick={() => setRightDrawerOpen(true)}>Right Drawer</HoloButton>
        </div>
        <HoloDrawer
          open={leftDrawerOpen}
          onClose={() => setLeftDrawerOpen(false)}
          placement="left"
          title="Left Panel"
        >
          Content from the left
        </HoloDrawer>
        <HoloDrawer
          open={rightDrawerOpen}
          onClose={() => setRightDrawerOpen(false)}
          placement="right"
          title="Right Panel"
        >
          Content from the right
        </HoloDrawer>
      </ComponentDemo>

      <ComponentDemo id="confirm" title="HoloConfirm" description="Confirmation dialogs with different types and layouts">
        <div className="flex flex-wrap gap-4">
          <HoloButton variant="secondary" onClick={() => setConfirmInfo(true)}>Info</HoloButton>
          <HoloButton variant="secondary" onClick={() => setConfirmSuccess(true)}>Success</HoloButton>
          <HoloButton variant="secondary" onClick={() => setConfirmWarning(true)}>Warning</HoloButton>
          <HoloButton variant="secondary" onClick={() => setConfirmDanger(true)}>Danger</HoloButton>
          <HoloButton variant="secondary" onClick={() => setConfirmHorizontal(true)}>Horizontal</HoloButton>
        </div>
        <HoloConfirm open={confirmInfo} type="info" title="Information" description="Proceed with this action?" onConfirm={() => setConfirmInfo(false)} onCancel={() => setConfirmInfo(false)} />
        <HoloConfirm open={confirmSuccess} type="success" title="Operation Successful" description="Your changes have been saved." confirmText="OK" cancelText={false} onConfirm={() => setConfirmSuccess(false)} onCancel={() => setConfirmSuccess(false)} maskClosable />
        <HoloConfirm open={confirmWarning} type="warning" title="Warning" description="This may have side effects." onConfirm={() => setConfirmWarning(false)} onCancel={() => setConfirmWarning(false)} />
        <HoloConfirm open={confirmDanger} type="danger" title="Delete Item" description="This action cannot be undone." confirmText="Delete" onConfirm={() => setConfirmDanger(false)} onCancel={() => setConfirmDanger(false)} />
        <HoloConfirm open={confirmHorizontal} type="info" layout="horizontal" title="Quick Confirm" description="Are you sure?" onConfirm={() => setConfirmHorizontal(false)} onCancel={() => setConfirmHorizontal(false)} maskClosable />
      </ComponentDemo>

      <ComponentDemo id="alert" title="HoloAlert" description="Alert messages with different types">
        <div className="space-y-4">
          <HoloAlert type="info" title="This is an info alert" />
          <HoloAlert type="success" title="This is a success alert" />
          <HoloAlert type="warning" title="This is a warning alert" />
          <HoloAlert type="error" title="This is an error alert" />
          <HoloAlert type="info" title="This alert is closable" closable />
        </div>
      </ComponentDemo>

      <ComponentDemo id="progress" title="HoloProgress" description="Progress bars with different states and sizes">
        <div className="space-y-4">
          <HoloProgress percent={0} />
          <HoloProgress percent={30} />
          <HoloProgress percent={70} />
          <HoloProgress percent={100} />
          <HoloProgress percent={50} status="error" />
          <HoloProgress percent={60} size="sm" />
        </div>
      </ComponentDemo>

      <ComponentDemo id="skeleton" title="HoloSkeleton" description="Loading placeholders">
        <div className="space-y-4">
          <HoloSwitch checked={skeletonLoading} onChange={setSkeletonLoading} label="Loading State" />
          <HoloSkeleton loading={skeletonLoading} avatar title>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div>
                <h3>User Profile</h3>
                <p>This content is loaded</p>
              </div>
            </div>
          </HoloSkeleton>
        </div>
      </ComponentDemo>

      <ComponentDemo id="spinner" title="HoloSpinner" description="Loading spinners">
        <div className="flex items-center gap-8">
          <HoloSpinner size="sm" />
          <HoloSpinner size="md" />
          <HoloSpinner size="lg" />
          <HoloSpinner size="md" label="Loading..." />
        </div>
      </ComponentDemo>

      <ComponentDemo id="hexagon-loader" title="HexagonLoader" description="Hexagonal loading animation">
        <HexagonLoader />
      </ComponentDemo>
    </div>
  );
}