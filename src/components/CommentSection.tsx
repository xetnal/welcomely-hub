
import React, { useState } from 'react';
import { Task } from '@/lib/types';
import { format } from 'date-fns';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CommentSectionProps {
  task: Task;
  onAddComment?: (taskId: string, content: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ task, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (onAddComment) {
      onAddComment(task.id, newComment.trim());
      setNewComment('');
      toast.success('Comment added');
    } else if (task.addComment) {
      task.addComment(newComment.trim());
      setNewComment('');
      toast.success('Comment added');
    } else {
      console.error('No method to add comment provided');
      toast.error('Unable to add comment');
    }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {task.comments.length > 0 ? (
          task.comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="bg-muted/50 rounded p-3 text-sm"
            >
              <div className="flex justify-between mb-1">
                <span className="font-medium">{comment.author}</span>
                <span className="text-xs text-muted-foreground">
                  {format(comment.timestamp, 'MMM d, h:mm a')}
                </span>
              </div>
              <p>{comment.content}</p>
            </motion.div>
          ))
        ) : (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            No comments yet
          </motion.p>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[60px] text-sm resize-none"
        />
        <Button type="submit" size="sm" className="self-end">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default CommentSection;
