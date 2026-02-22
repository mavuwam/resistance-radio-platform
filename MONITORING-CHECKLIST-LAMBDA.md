# Lambda Migration Monitoring Checklist

## Monitoring Period

**Duration:** 7 days  
**Start Date:** February 22, 2026  
**End Date:** March 1, 2026  
**Purpose:** Verify Lambda backend stability before EC2 decommissioning

## Daily Monitoring Tasks

### Day 1: February 22, 2026
- [ ] **Error Rate Check**
  - [ ] Review Sentry dashboard
  - [ ] Target: < 1% error rate
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Response Time Check**
  - [ ] Review Lambda CloudWatch metrics
  - [ ] Compare with EC2 baseline
  - [ ] Target: Similar to EC2 (~200-500ms)
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Lambda Costs**
  - [ ] Check AWS billing dashboard
  - [ ] Target: ~$0.20/month prorated
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **User Feedback**
  - [ ] Check for user-reported issues
  - [ ] Review support tickets
  - [ ] Notes: _____

- [ ] **Functional Testing**
  - [ ] Test shows page
  - [ ] Test articles page
  - [ ] Test episodes page
  - [ ] Test events page
  - [ ] Test admin dashboard
  - [ ] Notes: _____

### Day 2: February 23, 2026
- [ ] **Error Rate Check**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Response Time Check**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Lambda Costs**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **User Feedback**
  - [ ] Notes: _____

- [ ] **CloudWatch Logs Review**
  - [ ] Check for unusual patterns
  - [ ] Review cold start frequency
  - [ ] Notes: _____

### Day 3: February 24, 2026
- [ ] **Error Rate Check**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Response Time Check**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Lambda Costs**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **User Feedback**
  - [ ] Notes: _____

- [ ] **Database Connection Health**
  - [ ] Check RDS connection metrics
  - [ ] Review connection pool usage
  - [ ] Notes: _____

### Day 4: February 25, 2026
- [ ] **Error Rate Check**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Response Time Check**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Lambda Costs**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **User Feedback**
  - [ ] Notes: _____

- [ ] **Mid-Week Review**
  - [ ] Assess overall stability
  - [ ] Identify any trends
  - [ ] Decision: Continue monitoring / Rollback
  - [ ] Notes: _____

### Day 5: February 26, 2026
- [ ] **Error Rate Check**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Response Time Check**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Lambda Costs**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **User Feedback**
  - [ ] Notes: _____

- [ ] **Performance Comparison**
  - [ ] Compare Lambda vs EC2 metrics
  - [ ] Document improvements/regressions
  - [ ] Notes: _____

### Day 6: February 27, 2026
- [ ] **Error Rate Check**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Response Time Check**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Lambda Costs**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **User Feedback**
  - [ ] Notes: _____

- [ ] **Prepare for Final Review**
  - [ ] Compile week's metrics
  - [ ] Prepare recommendation
  - [ ] Notes: _____

### Day 7: February 28, 2026
- [ ] **Error Rate Check**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Response Time Check**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **Lambda Costs**
  - [ ] Actual: _____
  - [ ] Notes: _____

- [ ] **User Feedback**
  - [ ] Notes: _____

- [ ] **Final Review**
  - [ ] Overall error rate: _____
  - [ ] Average response time: _____
  - [ ] Total Lambda costs: _____
  - [ ] User satisfaction: _____
  - [ ] **Decision:** Proceed with EC2 decommissioning / Rollback
  - [ ] Notes: _____

## Success Criteria

### Must Meet All:
- ✅ Error rate < 1% throughout monitoring period
- ✅ Response times comparable to EC2 (within 20%)
- ✅ No critical functionality broken
- ✅ Lambda costs within expected range (~$0.20/month)
- ✅ No major user complaints

### Nice to Have:
- ⭐ Response times better than EC2
- ⭐ Zero cold start issues reported
- ⭐ Positive user feedback
- ⭐ Lower costs than estimated

## Monitoring Tools

### AWS CloudWatch
- **Lambda Metrics:** Invocations, Duration, Errors, Throttles
- **API Gateway Metrics:** Count, Latency, 4XX/5XX errors
- **Logs:** `/aws/lambda/ResistanceRadio-API-dev`

**Access:**
```bash
# View Lambda metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=ResistanceRadio-API-dev \
  --start-time 2026-02-22T00:00:00Z \
  --end-time 2026-02-23T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### Sentry
- **Dashboard:** [Your Sentry URL]
- **Metrics:** Error rate, affected users, error types
- **Alerts:** Configured for >1% error rate

### AWS Cost Explorer
- **Service:** Lambda
- **Time Range:** Last 7 days
- **Granularity:** Daily
- **Filter:** Function = ResistanceRadio-API-dev

### Browser Testing
- **Production URL:** https://resistanceradiostation.org
- **Network Tab:** Verify requests go to Lambda endpoint
- **Console:** Check for JavaScript errors

## Alert Thresholds

### Critical (Immediate Action Required)
- Error rate > 5%
- Response time > 2x EC2 baseline
- Lambda costs > $5/day
- Complete service outage

**Action:** Execute rollback procedure immediately

### Warning (Monitor Closely)
- Error rate 1-5%
- Response time 1.5-2x EC2 baseline
- Lambda costs $1-5/day
- Intermittent issues

**Action:** Investigate and prepare for potential rollback

### Normal (Continue Monitoring)
- Error rate < 1%
- Response time similar to EC2
- Lambda costs < $1/day
- No user complaints

**Action:** Continue daily monitoring

## Issue Tracking

### Issue Log Template

**Date:** _____  
**Severity:** Critical / Warning / Info  
**Description:** _____  
**Impact:** _____  
**Action Taken:** _____  
**Resolution:** _____  
**Follow-up Required:** Yes / No

### Common Issues to Watch For

1. **Cold Start Latency**
   - Symptom: First request after idle period is slow
   - Threshold: >3 seconds
   - Action: Consider provisioned concurrency

2. **Database Connection Exhaustion**
   - Symptom: Connection timeout errors
   - Threshold: >10 connection errors/day
   - Action: Review connection pooling

3. **Memory Issues**
   - Symptom: Out of memory errors
   - Threshold: Any OOM errors
   - Action: Increase Lambda memory

4. **Timeout Errors**
   - Symptom: 504 Gateway Timeout
   - Threshold: >5 timeouts/day
   - Action: Increase Lambda timeout or optimize code

5. **CORS Errors**
   - Symptom: Browser console CORS errors
   - Threshold: Any CORS errors
   - Action: Review API Gateway CORS configuration

## Weekly Summary Template

**Week:** February 22-28, 2026

### Metrics Summary
- **Average Error Rate:** _____
- **Average Response Time:** _____
- **Total Lambda Invocations:** _____
- **Total Lambda Costs:** _____
- **Cold Starts:** _____
- **User Complaints:** _____

### Issues Encountered
1. _____
2. _____
3. _____

### Positive Observations
1. _____
2. _____
3. _____

### Recommendation
- [ ] ✅ Proceed with EC2 decommissioning
- [ ] ⚠️ Extend monitoring period
- [ ] ❌ Rollback to EC2

### Justification
_____

### Next Steps
1. _____
2. _____
3. _____

## EC2 Decommissioning Decision

**Date:** March 1, 2026

### Final Decision
- [ ] **Proceed:** Decommission EC2 instance
- [ ] **Extend:** Continue monitoring for another week
- [ ] **Rollback:** Revert to EC2

### Approval
- **Approved By:** _____
- **Date:** _____
- **Signature:** _____

### Decommissioning Steps (If Approved)
1. [ ] Stop EC2 instance
2. [ ] Monitor for 24 hours
3. [ ] Terminate EC2 instance
4. [ ] Update documentation
5. [ ] Remove EC2 references from code
6. [ ] Celebrate cost savings! 🎉

---

**Created:** February 22, 2026  
**Owner:** Platform Operations Team  
**Review Frequency:** Daily during monitoring period
