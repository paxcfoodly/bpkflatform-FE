/**
 * BPK Hub — 폼 이탈 확인 모달
 */
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/components/ui';

interface LeaveConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LeaveConfirmModal({ open, onConfirm, onCancel }: LeaveConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>페이지를 나가시겠습니까?</DialogTitle>
          <DialogDescription>
            작성 중인 내용이 저장되지 않습니다. 정말 나가시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="md" onClick={onCancel}>
            계속 작성
          </Button>
          <Button variant="destructive" size="md" onClick={onConfirm}>
            나가기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
