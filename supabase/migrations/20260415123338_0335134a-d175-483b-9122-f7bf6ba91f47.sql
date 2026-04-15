-- Allow conversation participants to update their conversations (e.g. updated_at on new message)
CREATE POLICY "Participants can update their conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = participant_1 OR auth.uid() = participant_2)
WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);