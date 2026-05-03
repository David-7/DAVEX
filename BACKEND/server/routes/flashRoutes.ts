import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { FlashPrize } from "../models/FlashPrize.js";

const router = express.Router();

// Admin creates a flash prize
router.post('/', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { title, code, revealAt, expirySeconds, singleWinner } = req.body;
    const userId = (req as any).user?._id;

    // Basic validation
    const errors: string[] = [];
    if (!title || typeof title !== 'string' || title.trim().length < 3) errors.push('title (min 3 chars)');
    let revealDate: Date | null = null;
    if (revealAt) {
      revealDate = new Date(revealAt);
      if (isNaN(revealDate.getTime())) errors.push('revealAt (invalid date)');
    } else {
      revealDate = new Date();
    }
    const expiryNum = Number(expirySeconds ?? 0);
    if (!Number.isInteger(expiryNum) || expiryNum <= 0) errors.push('expirySeconds (positive integer)');
    const singleWinnerFlag = Boolean(singleWinner);

    // #region agent log (request received)
    fetch('http://127.0.0.1:7752/ingest/36784df5-29b2-41d0-b2cf-049f8d9baec0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'defed0'},body:JSON.stringify({sessionId:'defed0',runId:String(req.headers['x-debug-run-id'] || 'run1'),hypothesisId:'H4',location:'flashRoutes.ts:createPrize',message:'Create flash prize request received',data:{title,hasCode:Boolean(code),revealAt:revealDate?.toISOString?.(),expirySeconds:expiryNum,singleWinner:singleWinnerFlag,hasUserId:Boolean(userId)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (errors.length) {
      console.warn('Flash prize validation failed:', errors.join(', '));
      // agent log for validation failure
      fetch('http://127.0.0.1:7752/ingest/36784df5-29b2-41d0-b2cf-049f8d9baec0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'defed0'},body:JSON.stringify({sessionId:'defed0',runId:String(req.headers['x-debug-run-id'] || 'run1'),hypothesisId:'H4-VAL',location:'flashRoutes.ts:createPrize:validation',message:'Validation failed for create flash prize',data:{errors,body:req.body,userId},timestamp:Date.now()})}).catch(()=>{});
      return res.status(400).json({ message: 'Invalid input', errors });
    }

    const prize = await FlashPrize.create({ title: title.trim(), code: code || undefined, revealAt: revealDate, expirySeconds: expiryNum, singleWinner: singleWinnerFlag, createdBy: userId });
    console.log('Flash prize created by', String(userId), 'id=', prize._id?.toString?.());
    // agent log for success
    fetch('http://127.0.0.1:7752/ingest/36784df5-29b2-41d0-b2cf-049f8d9baec0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'defed0'},body:JSON.stringify({sessionId:'defed0',runId:String(req.headers['x-debug-run-id'] || 'run1'),hypothesisId:'H4-SUCCESS',location:'flashRoutes.ts:createPrize:success',message:'Flash prize created',data:{prizeId:prize._id?.toString?.(),title:prize.title,createdBy:userId},timestamp:Date.now()})}).catch(()=>{});
    res.status(201).json(prize);
  } catch (err: any) {
    console.error('Create flash prize error', err);
    res.status(400).json({ message: err.message });
  }
});

// Get active prize (students)
router.get('/active', protect, async (req, res) => {
  try {
    const now = new Date();
    const prize = await FlashPrize.findOne({ revealAt: { $lte: now }, claimedBy: null }).sort({ revealAt: -1 });
    // #region agent log
    fetch('http://127.0.0.1:7752/ingest/36784df5-29b2-41d0-b2cf-049f8d9baec0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'defed0'},body:JSON.stringify({sessionId:'defed0',runId:String(req.headers['x-debug-run-id'] || 'run1'),hypothesisId:'H1',location:'flashRoutes.ts:getActive',message:'Active prize lookup result',data:{hasPrize:Boolean(prize),now:now.toISOString(),prizeId:prize?._id?.toString?.() || null,revealAt:prize?.revealAt?.toISOString?.() || null,expirySeconds:prize?.expirySeconds ?? null,singleWinner:prize?.singleWinner ?? null,claimedBy:prize?.claimedBy?.toString?.() || null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!prize) return res.json({ active: false });
    const expiryTime = new Date(prize.revealAt.getTime() + prize.expirySeconds * 1000);
    // #region agent log
    fetch('http://127.0.0.1:7752/ingest/36784df5-29b2-41d0-b2cf-049f8d9baec0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'defed0'},body:JSON.stringify({sessionId:'defed0',runId:String(req.headers['x-debug-run-id'] || 'run1'),hypothesisId:'H2',location:'flashRoutes.ts:getActiveExpiryCheck',message:'Active prize expiry evaluation',data:{nowMs:now.getTime(),expiryMs:expiryTime.getTime(),isExpired:now > expiryTime},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (now > expiryTime) return res.json({ active: false });
    res.json({ active: true, prize: { id: prize._id, title: prize.title } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Claim a prize (first-come wins)
router.post('/:id/claim', protect, async (req, res) => {
  try {
    const now = new Date();
    const existingPrize = await FlashPrize.findById(req.params.id).select('_id revealAt expirySeconds singleWinner claimedBy claimedAt');
    // #region agent log
    fetch('http://127.0.0.1:7752/ingest/36784df5-29b2-41d0-b2cf-049f8d9baec0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'defed0'},body:JSON.stringify({sessionId:'defed0',runId:String(req.headers['x-debug-run-id'] || 'run1'),hypothesisId:'H2',location:'flashRoutes.ts:claimPreCheck',message:'Claim request pre-check prize state',data:{prizeId:req.params.id,userId:(req as any).user?._id?.toString?.() || null,now:now.toISOString(),hasPrize:Boolean(existingPrize),revealAt:existingPrize?.revealAt?.toISOString?.() || null,expirySeconds:existingPrize?.expirySeconds ?? null,singleWinner:existingPrize?.singleWinner ?? null,claimedBy:existingPrize?.claimedBy?.toString?.() || null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const prize = await FlashPrize.findOneAndUpdate(
      { _id: req.params.id, claimedBy: null },
      { claimedBy: (req as any).user?._id, claimedAt: new Date() },
      { new: true }
    );
    // #region agent log
    fetch('http://127.0.0.1:7752/ingest/36784df5-29b2-41d0-b2cf-049f8d9baec0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'defed0'},body:JSON.stringify({sessionId:'defed0',runId:String(req.headers['x-debug-run-id'] || 'run1'),hypothesisId:'H3',location:'flashRoutes.ts:claimUpdateResult',message:'Claim update result',data:{prizeId:req.params.id,claimSucceeded:Boolean(prize),singleWinner:prize?.singleWinner ?? existingPrize?.singleWinner ?? null,claimedByAfter:prize?.claimedBy?.toString?.() || null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!prize) return res.status(410).json({ message: 'Prize already claimed or expired' });
    res.json({ message: 'Prize claimed', prizeId: prize._id });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
